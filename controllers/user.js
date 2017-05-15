const _ = require('lodash')
const sharp = require('sharp')
const User = require('../models/user')


module.exports.get = function(req, res, next) {
  const username = req.params.username

  User.findOne({ username }, (err, user) => {
    if (err) return next(err)
    if (!user) return res.sendStatus(404)

    res.json(user)
  })
}


module.exports.create = function(req, res, next) {
  const username = req.body.username
  const password = req.body.password

  if (!username || !password) return next({ status: 400, message: 'Username or password is not found, both should be provided.' })
  if (password.length < 6) return next({ status: 400, message: 'Password is too short, should be at least 6 characters.' })

  User.findOne({ username }, (err, user) => {
    if (err) return next(err)
    if (user) return next({ status: 400, message: `Username is already registered.` })

    const newUser = new User({ username, password })
    newUser.save((err, user) => {
      if (err) return next(err)

      res.json(user)
    })
  })
}


module.exports.update = function(req, res, next) {
  const username = req.params.username
  const update = _.pick(req.body, ['name', 'email', 'phone', 'company', 'location'])

  User.findOneAndUpdate({ username }, update, { new: true }, (err, user) => {
    if (err) return next(err)
    if (!user) return res.sendStatus(404)

    res.json(user)
  })
}


module.exports.delete = function(req, res, next) {
  const username = req.params.username

  User.findOneAndRemove({ username }, (err, user) => {
    if (err) return next(err)
    if (!user) return res.sendStatus(404)

    res.sendStatus(204)
  })

}


module.exports.getAvatar = function(req, res, next) {
  const username = req.params.username

  User.findOne({ username }, (err, user) => {
    if (err) return next(err)
    if (!user || !user.avatar) return res.sendStatus(404)

    res.type('png')
    res.send(user.avatar)
  })
}


module.exports.updateAvatar = function(req, res, next) {
  const username = req.params.username
  const filePath = req.files[0].path

  sharp(filePath)
    .resize(100, 100)
    .max()
    .background('white')
    .toFormat('png').toBuffer((err, avatar) => {
      if (err) return next(err)

      User.findOneAndUpdate({ username }, { avatar }, { new: true }, (err, user) => {
        if (err) return next(err)
        if (!user) return res.sendStatus(404)

        res.sendStatus(204)
      })
    })
}
