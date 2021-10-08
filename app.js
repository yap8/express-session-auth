require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session)

const {
  requestAuth,
  getUser
} = require('./middleware/authMiddleware')

const app = express()

// connect db & start server
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('db connected'))
  .then(() => app.listen(3000))
  .then(() => console.log('server started'))
  .catch(err => console.log(err))

const store = new MongoDBSession({
  uri: process.env.DB_URI,
  collection: 'sessions'
})

// view engine
app.set('view engine', 'ejs')

// middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store
}))

app.use(express.urlencoded({ extended: false }))

// routes
app.get('*', getUser)
app.get('/', requestAuth, (req, res) => res.render('index'))

// auth routes
app.use(require('./routes/authRoutes'))

// 404 route
app.use((req, res) => res.render('404'))
