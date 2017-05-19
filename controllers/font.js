const fs = require('fs')
const path = require('path')
const async = require('async')
const mkdirp = require('mkdirp')
const fontnik = require('fontnik')
const fontscope = require('font-scope')
const glyphPbfComposite = require('@mapbox/glyph-pbf-composite')
const Font = require('../models/font')


module.exports.list = function(req, res, next) {
  const owner = req.params.owner

  Font.find({ owner }, '-coverages', (err, fonts) => {
    if (err) return next(err)

    res.json(fonts)
  })
}


module.exports.get = function(req, res, next) {
  const owner = req.params.owner
  const fontname = req.params.fontname

  Font.findOne({ owner, fontname }, (err, font) => {
    if (err) return next(err)
    if (!font) return res.sendStatus(404)

    res.json(font)
  })
}


module.exports.create = function(req, res, next) {
  const owner = req.params.owner
  const filePath = req.files[0].path
  const originalname = req.files[0].originalname

  const ext = path.extname(originalname).toLowerCase()
  if (ext !== '.ttf' && ext !== '.otf') {
    fs.unlink(filePath)
    return next({ status: 400, message: 'Only supports otf, ttf fonts.' })
  }

  async.autoInject({
    buffer: callback => {
      fs.readFile(filePath, callback)
    },

    metadata: (buffer, callback) => {
      fontnik.load(buffer, (err, faces) => {
        if (err) return callback(err)

        faces[0].fontname = [faces[0].family_name, faces[0].style_name].join(' ').trim()
        callback(null, faces[0])
      })
    },

    fontDir: (callback) => {
      const dir = path.join('fonts', owner)
      mkdirp(dir, err => callback(err, dir))
    },

    rename: (metadata, fontDir, callback) => {
      const fontPath = path.join(fontDir, metadata.fontname)
      fs.rename(filePath, fontPath, callback)
    },

    writeDB: (metadata, rename, callback) => {
      const newFont = {
        fontname: metadata.fontname,
        owner: owner,
        familyName: metadata.family_name,
        styleName: metadata.style_name,
        coverages: fontscope([metadata.points]).map(coverage => {
          return {
            language: coverage.name,
            code: coverage.id,
            percentage: Math.round(coverage.count / coverage.total * 100)
          }
        })
      }

      Font.findOneAndUpdate({
        fontname: newFont.fontname,
        owner: newFont.owner
      }, newFont, { upsert: true, new: true, setDefaultsOnInsert: true }, callback)
    }
  }, (err, results) => {
    fs.unlink(filePath, () => {})
    if (err) return next(err)

    res.json(results.writeDB)
  })
}


module.exports.delete = function(req, res, next) {
  const owner = req.params.owner
  const fontname = req.params.fontname
  const fontPath = path.join('fonts', owner, fontname)

  Font.findOneAndRemove({ owner, fontname }, (err, font) => {
    if (err) return next(err)
    if (!font) return res.sendStatus(404)

    fs.unlink(fontPath, err => {
      if (err && err.code !== 'ENOENT') return next(err)

      res.sendStatus(204)
    })
  })
}


module.exports.getGlyphs = function(req, res, next) {
  const owner = req.params.owner
  const fontnames = req.params.fontstack.split(',').map(fontname => fontname.trim())
  const start = +req.params.start
  const end = +req.params.end

  async.autoInject({
    fonts: callback => {
      async.reduce(fontnames, [], (result, fontname, next) => {
        const fontPath = path.join('fonts', owner, fontname)
        fs.readFile(fontPath, (err, buffer) => {
          if (!err) result.push(buffer)
          next(null, result)
        })
      }, callback)
    },

    glyphs: (fonts, callback) => {
      async.map(fonts, (font, next) => {
        fontnik.range({ font, start, end }, next)
      }, callback)
    },

    combine: (glyphs, callback) => {
      if (glyphs.length === 0) return callback({ status: 404 })
      callback(null, glyphPbfComposite.combine(glyphs))
    }
  }, (err, results) => {
    if (err) return next(err)

    res.set('Content-Type', 'application/x-protobuf')
    res.send(results.combine)
  })
}
