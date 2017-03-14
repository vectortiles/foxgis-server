const fs = require('fs')
const path = require('path')
const url = require('url')
const _ = require('lodash')
const async = require('async')
const mkdirp = require('mkdirp')
const mapboxFileSniff = require('@mapbox/mapbox-file-sniff')
const shapefileFairy = require('@mapbox/shapefile-fairy')
const tilelive = require('@mapbox/tilelive')
const omnivore = require('@mapbox/tilelive-omnivore')
const mbtiles = require('mbtiles')
const merge = require('tilelive-merge')
const Tileset = require('../models/tileset')


omnivore.registerProtocols(tilelive)
mbtiles.registerProtocols(tilelive)
merge.registerProtocols(tilelive)


module.exports.list = function(req, res, next) {
  const owner = req.params.owner

  Tileset.find({ owner }, (err, tilesets) => {
    if (err) return next(err)

    res.json(tilesets)
  })
}


module.exports.get = function(req, res, next) {
  const owner = req.params.owner
  const tilesetIds = req.params.tilesetIds.split(',').map(id => id.trim())
  const tilesetPath = path.join('tilesets', owner, tilesetId)

  const source = {
    protocol: "merge:",
    query: {
      sources: tilesetIds.map(tilesetId => 'mbtiles://' + path.resolve('tilesets', owner, tilesetId))
    }
  }

  async.reduce(tilesetIds, [], (tilesets, tilesetId, callback) => {
    Tileset.findOne({ owner, tilesetId }, (err, tileset) => {
      if (!err) tilesets.push(tileset)
      callback(null, tilesets)
    })
  }, (err, tilesets) => {
    if (err) return next(err)
    if (!tilesets.length) return res.sendStatus(404)

    tilelive.getInfo(source, (err, info) => {
      if (err) return next(err)

      const urlObject = url.parse(req.originalUrl)
      urlObject.protocol = req.protocol
      urlObject.host = req.get('host')
      urlObject.pathname = urlObject.pathname + '/{z}/{x}/{y}.' + info.format
      info.tiles = [url.format(urlObject)]
      info.scheme = 'xyz'
      info.tilesetId = tilesets.map(tileset => tileset.tilesetId).join(',')
      info.name = tilesets.map(tileset => tileset.name).join(',')
      info.description = tilesets.map(tileset => tileset.description).join(',')

      res.json(info)
    })
  })
}


module.exports.create = function(req, res, next) {
  const owner = req.params.owner
  const tilesetId = req.params.tilesetId
  const filePath = req.files[0].path
  const originalname = req.files[0].originalname

  async.autoInject({
    tileset: callback => {
      if (!tilesetId) {
        const tileset = new Tileset({ owner })
        return tileset.save((err, tileset) => callback(err, tileset))
      }

      Tileset.findOne({ owner, tilesetId }, (err, tileset) => {
        if (err) return callback(err)
        if (!tileset) return callback({ status: 404 })
        if (!tileset.complete) return callback({ status: 400, message: 'Previous uploading has not completed yet.' })

        callback(null, tileset)
      })
    },

    fileinfo: callback => {
      mapboxFileSniff.fromFile(filePath, callback)
    },

    source: (fileinfo, callback) => {
      if (fileinfo.protocol !== 'omnivore:' && fileinfo.protocol !== 'mbtiles:') {
        return callback({ status: 400, message: 'Unsupport file format.' })
      }

      if (fileinfo.type === 'zip') {
        return shapefileFairy(filePath, (err, path) => {
          callback(err, fileinfo.protocol + '//' + path)
        })
      }

      callback(null, fileinfo.protocol + '//' + path.resolve(filePath))
    },

    info: (source, callback) => {
      tilelive.info(source, callback)
    },

    tilesetDir: (callback) => {
      const dir = path.join('tilesets', owner)
      mkdirp(dir, err => callback(err, dir))
    },

    copy: (tileset, source, tilesetDir, callback) => {
      // Early callback so that import tileset in the background
      callback()

      const dest = `mbtiles://${path.resolve(tilesetDir)}/${tileset.tilesetId}`
      const options = {
        retry: 2,
        timeout: 120000,
        close: true,
        progress: _.throttle((stats, p) => {
          tileset.progress = Math.round(p.percentage)
          tileset.save()
        }, 1000, { trailing: true })
      }

      tilelive.copy(source, dest, options, err => {
        tileset.complete = true
        tileset.error = err
        tileset.save()
        fs.unlink(filePath)
      })
    },

    writeDB: (tileset, info, callback) => {
      tileset.name = tileset.name || info.name || path.basename(originalname, path.extname(originalname))
      tileset.description = tileset.description || info.description
      tileset.complete = false
      tileset.progress = 0
      tileset.error = undefined
      tileset.save((err, tileset) => callback(err, tileset))
    }
  }, (err, results) => {
    if (err) {
      fs.unlink(filePath, () => {})
      return next(err)
    }

    res.json(results.writeDB)
  })
}


module.exports.update = function(req, res, next) {
  const owner = req.params.owner
  const tilesetId = req.params.tilesetId
  const update = _.pick(req.body, ['name', 'description'])

  Tileset.findOneAndUpdate({ owner, tilesetId }, update, { new: true }, (err, tileset) => {
    if (err) return next(err)
    if (!tileset) return res.sendStatus(404)

    res.json(tileset)
  })
}


module.exports.delete = function(req, res, next) {
  const owner = req.params.owner
  const tilesetId = req.params.tilesetId
  const tilesetPath = path.join('tilesets', owner, tilesetId)

  Tileset.findOneAndRemove({ owner, tilesetId }, (err, tileset) => {
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
  const tilesetIds = req.params.tilesetIds.split(',').map(id => id.trim())
  const z = +req.params.z || 0
  const x = +req.params.x || 0
  const y = +req.params.y || 0

  const source = {
    protocol: "merge:",
    query: {
      sources: tilesetIds.map(tilesetId => 'mbtiles://' + path.resolve('tilesets', owner, tilesetId))
    }
  }

  tilelive.load(source, (err, source) => {
    if (err) return next(err)

    source.getTile(z, x, y, (err, data, headers) => {
      if (err) return next(err)
      if (!data) return res.sendStatus(404)

      res.set(headers)
      res.send(data)
    })
  })
}
