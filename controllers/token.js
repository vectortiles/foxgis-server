const _ = require('lodash')
const Token = require('../models/token')


module.exports.list = function(req, res, next) {
  const owner = req.params.owner

  Token.find({ owner }, (err, tokens) => {
    if (err) return next(err)

    res.json(tokens)
  })
}


module.exports.create = function(req, res, next) {
  const owner = req.params.owner
  const update = _.pick(req.body, ['name', 'description', 'default', 'scopes'])

  const token = new Token(update)
  token.owner = owner

  token.save((err, token) => {
    if (err) return next(err)

    res.json(tokens)
  })
}


module.exports.update = function(req, res, next) {
  const owner = req.params.owner
  const tokenId = req.params.tokenId
  const update = _.pick(req.body, ['name', 'description', 'default', 'scopes'])

  Token.findOneAndUpdate({ owner, tokenId }, update, { new: true }, (err, token) => {
    if (err) return next(err)

    res.json(tokens)
  })
}


module.exports.delete = function(req, res, next) {
  const owner = req.params.owner
  const tokenId = req.params.tokenId

  Token.findOneAndRemove({ owner, tokenId }, (err, token) => {
    if (err) return next(err)
    if (!token) return res.sendStatus(404)

    res.sendStatus(204)
  })
}
