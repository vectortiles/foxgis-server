const _ = require('lodash')
const User = require('../models/user')


module.exports.get = function(req, res, next) {
  const username = req.params.username

  User.findOne({username}, (err, user) => {
    if (err) return next(err)
    if (!user) return res.sendStatus(404)

    res.json(user)
  })
}


module.exports.create = function(req, res, next) {

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

  User.findOneAndRemove({username}, (err, user) => {
    if (err) return next(err)
    if (!user) return res.sendStatus(404)

    res.sendStatus(204)
  })

}


module.exports.getAvatar = function(req, res, next) {

}


module.exports.updateAvatar = function(req, res, next) {

}
