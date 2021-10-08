const User = require('../models/user')

module.exports.requestAuth = (req, res, next) => {
  const { userId } = req.session

  if (!userId) {
    return res.redirect('/login')
  }

  next()
}

module.exports.getUser = async (req, res, next) => {
  const { userId } = req.session

  if (!userId) {
    res.locals.user = null
    return next()
  }

  const user = await User.findById(userId)
  
  if (!user) {
    res.locals.user = null
    return next()
  }

  res.locals.user = user
  next()
}
