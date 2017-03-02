const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const Tileset = require('../models/tileset')


module.exports.list = function(req, res, next) {
  const owner = req.params.owner

  Tileset.find({owner}, (err, tilesets) => {
    if (err) return next(err)

    res.json(tilesets)
  })
}


module.exports.get = function(req, res, next) {
  const owner = req.params.owner
  const tilesetId = req.params.tilesetId

  Tileset.findOne({owner, tilesetId}, (err, tileset) => {
    if (err) return next(err)
    if (!tileset) return res.sendStatus(404)

    res.json(tileset)
  })
}


module.exports.create = function(req, res, next) {

}


module.exports.replace = function(req, res, next) {

}


module.exports.update = function(req, res, next) {
  const owner = req.params.owner
  const tilesetId = req.params.tilesetId
  const update = _.pick(req.body, ['name', 'description'])

  Tileset.findOneAndUpdate({owner, tilesetId}, update, {new: true}, (err, tileset) => {
    if (err) return next(err)
    if (!tileset) res.sendStatus(404)

    res.json(tileset)
  })
}


module.exports.delete = function(req, res, next) {
  const owner = req.params.owner
  const tilesetId = req.params.tilesetId
  const tilesetPath = path.join('tilesets', owner, tilesetId)

  Tileset.findOneAndRemove({owner, tilesetId}, (err, tileset) => {
    if (err) return next(err)
    if (!tileset) return res.sendStatus(404)

    fs.unlink(tilesetPath, err => {
      if (err) return next(err)

      res.sendStatus(204)
    })
  })
}


module.exports.getTile = function(req, res, next) {

}
