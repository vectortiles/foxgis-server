const User = require('../models/user')


module.exports.create = function(req, res, next) {
  const username = req.body.username
  const password = req.body.password
  const email = req.body.email

  const user = new User({
    username,
    password,
    email
  })

  user.save(err => {
    if (err) return next(err)

    res.json(user)
  })
}


module.exports.retrieve = function(req, res, next) {
  const username = req.params.username

  User.findOne({ username }, (err, user) => {
    if (err) return next(err)

    if (!user) return res.sendStatus(404)

    res.json(user)
  })
}


module.exports.update = function(req, res, next) {
  const username = req.params.username
  const email = req.body.email

  User.findOneAndUpdate({ username }, { email }, { new: true }, (err, user) => {
    if (err) return next(err)

    if (!user) return res.sendStatus(404)

    res.json(user)
  })
}


module.exports.delete = function(req, res, next) {
  const username = req.params.username

  User.remove(err => {
    if (err) return next(err)

    res.sendStatus(204)
  })
}
