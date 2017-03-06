const _ = require('lodash')
const Style = require('../models/style')


module.exports.list = function(req, res, next) {
  const owner = req.params.owner

  Style.find({ owner }, 'styleId owner name description version createdAt updatedAt', (err, styles) => {
    if (err) return next(err)

    res.json(styles)
  })
}


module.exports.get = function(req, res, next) {
  const owner = req.params.owner
  const styleId = req.params.styleId

  Style.findOne({ owner, styleId }, (err, style) => {
    if (err) return next(err)
    if (!style) return res.sendStatus(404)

    res.json(style)
  })
}


module.exports.create = function(req, res, next) {
  const owner = req.params.owner
  const update = _.omit(req.body, ['styleId', 'owner', 'createdAt', 'updatedAt'])

  const style = new Style(update)
  style.owner = owner

  style.save((err, style) => {
    if (err) return next(err)

    res.json(style)
  })
}


module.exports.update = function(req, res, next) {
  const owner = req.params.owner
  const styleId = req.params.styleId
  const update = _.omit(req.body, ['styleId', 'owner', 'createdAt', 'updatedAt'])

  Style.findOneAndUpdate({ owner, styleId }, update, { new: true }, (err, style) => {
    if (err) return next(err)
    if (!style) return res.sendStatus(404)

    res.json(style)
  })
}


module.exports.delete = function(req, res, next) {
  const owner = req.params.owner
  const styleId = req.params.styleId

  Style.findOneAndRemove({ owner, styleId }, (err, style) => {
    if (err) return next(err)
    if (!style) return res.sendStatus(404)

    res.sendStatus(204)
  })
}


module.exports.getTile = function(req, res, next) {

}


module.exports.getStatic = function(req, res, next) {

}

module.exports.getHtml = function(req, res, next) {

}
