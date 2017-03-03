const fs = require('fs')
const path = require('path')
const url = require('url')
const _ = require('lodash')
const async = require('async')
const mkdirp = require('mkdirp')
const moment = require('moment')
const mapboxFileSniff = require('@mapbox/mapbox-file-sniff')
const shapefileFairy = require('@mapbox/shapefile-fairy')
const tilelive = require('@mapbox/tilelive')
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
  const tilesetPath = path.join('tilesets', owner, tilesetId)

  Tileset.findOne({owner, tilesetId}, (err, tileset) => {
    if (err) return next(err)
    if (!tileset) return res.sendStatus(404)

    const source = 'mbtiles://' + path.resolve(tilesetPath)
    tilelive.info(source, (err, info) => {
      if (err) return next(err)

      const urlObject = url.parse(req.originalUrl)
      urlObject.protocol = req.protocol
      urlObject.host = req.get('host')
      urlObject.path = urlObject.path + '/{z}/{x}/{y}.' + info.format
      info.tiles = [url.format(urlObject)]
      res.json(Object.assign(info, tileset))
    })
  })
}


module.exports.create = function(req, res, next) {
  const owner = req.params.owner
  const tilesetId = req.params.tilesetId
  const filePath = req.files[0].path

  async.autoInject({
    tileset: callback => {
      if (!tilesetId) {
        const tileset = new Tileset({owner})
        return tileset.save((err, tileset) => callback(err, tileset))
      }

      Tileset.findOne({owner, tilesetId}, (err, tileset) => {
        if (err) return callback(err)
        if (!tileset) return callback({status: 404})

        callback(null, tileset)
      })
    },

    fileinfo: callback => {
      mapboxFileSniff.fromFile(filePath, callback)
    },

    tilesetDir: callback => {
      const dir = path.join('tilesets', owner)
      mkdirp(dir, err => callback(err, dir))
    },

    source: (fileinfo, callback) => {
      if (fileinfo.type === 'zip') {
        return callback(null, fileinfo.protocol + '//' + filePath)
      }

      shapefileFairy(filePath, (err, path) => {
        callback(err, fileinfo.protocol + '//' + path)
      })
    },

    info: (source, callback) => {
      tilelive.info(source, callback)
    },

    writeDB: (tileset, info, callback) => {
      tileset.name = tileset.name || info.name
      tileset.description = tileset.description || info.description
      tileset.save((err, tileset) => callback(err, tileset))
    },

    copy: (tileset, tilesetDir, source, callback) => {
      const dest = `mbtiles://${path.resolve(tilesetDir)}/${tileset.tilesetId}`
      const options = {
        retry: 2,
        timeout: 60000,
        close: true,
        progress: (stats, p) => {
          process.stdout.write(`${tilesetId}: ${p.percentage}% | ${moment.duration(p.eta)}`)
        }
      }

      tilelive.copy(source, dest, options, callback)
    }
  }, (err, results) => {
    fs.unlink(filePath, () => {})
    if (err) return next(err)

    res.json(results.writeDB)
  })
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
  const owner = req.params.owner
  const tilesetId = req.params.tilesetId
  const z = +req.params.z || 0
  const x = +req.params.x || 0
  const y = +req.params.y || 0

  const tilesetPath = path.join('tilesets', owner, tilesetId)
  const source = 'mbtiles://' + path.resolve(tilesetPath)
  tilelive.load(source, (err, source) => {
    if (err) return next(err)

    source.getTile(z, x, y, (err, data, headers) => {
      if (err) return next(err)

      res.set(headers)
      res.send(data)
    })
  })
}
