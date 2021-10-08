const bcrypt = require('bcrypt')
const User = require('../models/user')

const handleErrors = (err) => {
  if (typeof err === 'string') return [err]
  if (err.code === 11000) return ['user with such email already exists']

  const { errors } = err

  return Object.keys(errors).map(error => errors[error].message)
}

const locals = { errors: [] }

module.exports.signup_get = (req, res) => res.render('signup', locals)
module.exports.login_get = (req, res) => res.render('login', locals)

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body

  try {
    if (password.length < 6) throw 'password should be at least 6 characters long'

    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(password, salt)

    const user = await User.create({
      email,
      password: hash
    })

    req.session.userId = user.id
    res.redirect('/')
  } catch (err) {
    const errors = handleErrors(err)

    res.render('signup', { errors })
  }
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) throw 'no user with such email found'

    const match = await bcrypt.compare(password, user.password)

    if (!match) throw 'password or email do not match'

    req.session.userId = user.id
    res.redirect('/')
  } catch (err) {
    console.log(err)
    const errors = handleErrors(err)

    res.render('login', { errors })
  }
}

module.exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
}
