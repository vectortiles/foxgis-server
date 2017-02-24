const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const async = require('async')
const mkdirp = require('mkdirp')
const shortid = require('shortid')
const zipfile = require('zipfile')
const AdmZip = require('adm-zip')
const rd = require('rd')
const spritezero = require('spritezero')
const Sprite = require('../models/sprite')


module.exports.list = function(req, res, next) {
  const owner = req.params.owner

  Sprite.find({owner}, (err, sprites) => {
    if (err) return next(err)

    res.json(sprites)
  })
}


module.exports.get = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId

  Sprite.findOne({owner, spriteId}, (err, sprite) => {
    if (err) return next(err)
    if (!sprite) return res.sendStatus(404)

    res.json(sprite)
  })
}


module.exports.create = function(req, res, next) {
  const owner = req.params.owner
  const filePath = req.files[0].path

  const spriteId = shortid.generate()
  const originalname = req.files[0].originalname
  const name = path.basename(originalname, path.extname(originalname))

  async.autoInject({
    spriteDir: callback => {
      const dir = path.join('sprites', owner, spriteId)
      mkdirp(dir, err => callback(err, dir))
    },
    unzip: (spriteDir, callback) => {
      try {
        const zip = new zipfile.ZipFile(filePath)
        async.each(zip.names, (name, next) => {
          if (path.extname(name) !== '.svg') return next()
          zip.copyFile(name, path.join(spriteDir, path.basename(name)), next)
        }, callback)

      } catch (err) {
        return callback(err)
      }
    },
    writeDB: (unzip, callback) => {
      const sprite = new Sprite({spriteId, owner, name})
      sprite.save((err, sprite) => callback(err, sprite))
    }
  }, (err, results) => {
    fs.unlink(filePath)

    if (err) return next(err)

    res.json(results.writeDB)
  })
}


module.exports.update = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId
  const update = _.pick(req.body, ['name', 'description'])

  Sprite.findOneAndUpdate({owner, spriteId}, update, {new: true}, (err, sprite) => {
    if (err) return next(err)
    if (!sprite) res.sendStatus(404)

    res.json(sprite)
  })
}


module.exports.delete = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId

  Sprite.findOneAndRemove({owner, spriteId}, (err, sprite) => {
    if (err) return next(err)
    if (!sprite) return res.sendStatus(404)

    res.sendStatus(204)
  })
}


module.exports.getIcons = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId
  const spriteDir = path.join('sprites', owner, spriteId)

  Sprite.findOne({owner, spriteId}, (err, sprite) => {
    if (err) return next(err)
    if (!sprite) return res.sendStatus(404)

    const zip = new AdmZip()
    zip.addLocalFolder(spriteDir)

    res.attachment(sprite.name + '.zip')
    res.send(zip.toBuffer())
  })
}


module.exports.getIcon = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId
  const icon = req.params.icon
  const iconPath = path.join('sprites', owner, spriteId, icon + '.svg')

  res.sendFile(path.resolve(iconPath), err => {
    if (err) return next(err)
  })
}


module.exports.createIcon = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId
  const icon = req.params.icon
  const iconPath = path.join('sprites', owner, spriteId, icon + '.svg')

  const filePath = req.files[0].path
  const originalname = req.files[0].originalname

  if (path.extname(originalname).toLowerCase() !== '.svg') {
    return res.status(400).json(new Error('Only supports svg icons'))
  }

  fs.rename(filePath, iconPath, err => {
    if (err) return next(err)

    res.sendStatus(204)
  })
}


module.exports.deleteIcon = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId
  const icon = req.params.icon
  const iconPath = path.join('sprites', owner, spriteId, icon + '.svg')

  fs.unlink(iconPath, function(err) {
    if (err && err.code === 'ENOENT') return res.sendStatus(404)
    if (err) return next(err)

    res.sendStatus(204)
  })
}


module.exports.getSprite = function(req, res, next) {
  const owner = req.params.owner
  const spriteId = req.params.spriteId
  const scale = +(req.params.scale || '@1x').slice(1, 2)
  const format = req.params.format || 'json'
  const spriteDir = path.join('sprites', owner, spriteId)

  async.autoInject({
    files: callback => {
      rd.readFileFilter(spriteDir, /\.svg$/i, callback)
    },
    svgs: (files, callback) => {
      async.map(files, (file, next) => {
        fs.readFile(file, (err, buffer) => {
          if (err) return next(err)
          next(null, {
            id: path.basename(file, path.extname(file)),
            svg: buffer
          })
        })
      }, callback)
    },
    sprite: (svgs, callback) => {
      if (format === 'json') {
        spritezero.generateLayout(svgs, scale, true, callback)
      } else {
        spritezero.generateLayout(svgs, scale, false, (err, layout) => {
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
