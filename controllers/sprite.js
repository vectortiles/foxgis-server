const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const async = require('async')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const rd = require('rd')
const spritezero = require('@mapbox/spritezero')
const Sprite = require('../models/sprite')


module.exports.list = function(req, res, next) {
  const owner = req.params.owner

  Sprite.find({ owner }, (err, sprites) => {
    if (err) return next(err)

    res.json(sprites)
  })
}


module.exports.get = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId

  Sprite.findOne({ owner, spriteId }, (err, sprite) => {
    if (err) return next(err)
    if (!sprite) return res.sendStatus(404)

    res.json(sprite)
  })
}


module.exports.create = function(req, res, next) {
  const owner = req.params.owner
  const name = req.body.name
  const description = req.body.description

  const sprite = new Sprite({ owner, name, description })
  sprite.save((err, sprite) => {
    if (err) return next(err)

    const spriteDir = path.join('sprites', owner, sprite.spriteId)
    mkdirp(spriteDir, err => {
      if (err) return next(err)

      res.json(sprite)
    })
  })
}


module.exports.update = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId
  const update = _.pick(req.body, ['name', 'description'])

  Sprite.findOneAndUpdate({ owner, spriteId }, update, { new: true }, (err, sprite) => {
    if (err) return next(err)
    if (!sprite) res.sendStatus(404)

    res.json(sprite)
  })
}


module.exports.delete = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId
  const spriteDir = path.join('sprites', owner, spriteId)

  Sprite.findOneAndRemove({ owner, spriteId }, (err, sprite) => {
    if (err) return next(err)
    if (!sprite) return res.sendStatus(404)

    rimraf(spriteDir, err => {
      if (err) return next(err)

      res.sendStatus(204)
    })
  })
}


module.exports.createIcon = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId
  const icon = req.params.icon
  const spriteDir = path.join('sprites', owner, spriteId)
  const iconPath = path.join(spriteDir, icon + '.svg')

  const filePath = req.files[0].path
  const originalname = req.files[0].originalname
  if (path.extname(originalname).toLowerCase() !== '.svg') {
    fs.unlink(filePath)
    return next({ status: 400, message: 'Only supports svg icons.' })
  }

  mkdirp(spriteDir, err => {
    if (err) return next(err)

    fs.rename(filePath, iconPath, err => {
      if (err) return next(err)

      res.sendStatus(204)
    })
  })
}


module.exports.deleteIcon = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId
  const icon = req.params.icon
  const iconPath = path.join('sprites', owner, spriteId, icon + '.svg')

  fs.unlink(iconPath, err => {
    if (err && err.code === 'ENOENT') return res.sendStatus(404)
    if (err) return next(err)

    res.sendStatus(204)
  })
}


module.exports.getSprite = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId
  const pixelRatio = +(req.params.scale || '@1x').slice(1, 2)
  const format = req.params.format || 'json'
  const spriteDir = path.join('sprites', owner, spriteId)

  async.autoInject({
    files: callback => {
      rd.readFileFilter(spriteDir, /\.svg$/i, callback)
    },

    imgs: (files, callback) => {
      async.map(files, (file, next) => {
        fs.readFile(file, (err, buffer) => {
          if (err) return next(err)
          next(null, {
            id: path.parse(file).name,
            svg: buffer
          })
        })
      }, callback)
    },

    sprite: (imgs, callback) => {
      if (format === 'json') {
        spritezero.generateLayout({ imgs, pixelRatio, format: true }, callback)
      } else {
        spritezero.generateLayout({ imgs, pixelRatio, format: false }, (err, layout) => {
          if (err) return callback(err)
          spritezero.generateImage(layout, callback)
        })
      }
    }
  }, (err, results) => {
    if (err && err.code === 'ENOENT') return res.sendStatus(404)
    if (err) return next(err)

    res.type(format)
    res.send(results.sprite)
  })
}
