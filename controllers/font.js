const fs = require('fs')
const path = require('path')
const async = require('async')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const fontmachine = require('fontmachine')
const fontscope = require('font-scope')
const Font = require('font')


module.exports.list = function(req, res, next) {
  const owner = req.params.owner

  Font.find({owner}, '-coverages', (err, fonts) => {
    if (err) return next(err)

    res.json(fonts)
  })
}


module.exports.get = function(req, res, next) {
  const owner = req.params.owner
  const fontname = req.params.fontname

  Font.findOne({owner, fontname}, (err, font) => {
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
    return res.status(400).json(new Error('Only supports otf, ttf fonts.'))
  }

  async.atuoInject({
    buffer: callback => {
      fs.readFile(filePath, callback)
    },

    font: (buffer, callback) => {
      fontmachine.makeGlyphs({ font: buffer, filetype: ext }, callback)
    },

    fontDir: (font, callback) => {
      const fontDir = path.join('fonts', owner, font.name)
      mkdirp(fontDir, err => callback(err, fontDir))
    },

    writePbf: (font, fontDir, callback) => {
      async.each(font.stack, (pbf, next) => {
        fs.writeFile(path.join(fontDir, pbf.name), pbf.data, next)
      }, callback)
    },

    WriteFont: (buffer, font, fontDir, callback) => {
      fs.rename(path.join(fontDir, font.name + ext), buffer, callback)
    },

    writeDB: (writePbf, WriteFont, font, callback) => {
      const newFont = {
        fontname: font.name,
        owner: newFont.owner,
        familyName: font.metadata.family_name,
        styleName: font.metadata.style_name,
        coverages: fontscope([font.codepoints]).map(coverage => {
          return {
            language: coverage.name,
            code: coverage.id,
            percentage: (coverage.count / coverage.total * 100).toFixed()
          }
        })
      }

      Font.findOneAndUpdate({
        fontname: newFont.fontname,
        owner: newFont.owner
      }, newFont, { upsert: true, new: true, setDefaultsOnInsert: true }, callback)
    }
  }, (err, results) => {
    fs.unlink(filePath)
    if (err) return next(err)

    res.json(results.writeDB)
  })
}


module.exports.delete = function(req, res, next) {
  const owner = req.params.owner
  const fontname = req.params.fontname
  const fontDir = path.join('fonts', owner, fontname)

  Font.findOneAndRemove({owner, fontname}, (err, font) => {
    if (err) return next(err)
    if (!font) return res.sendStatus(404)

    rimraf(fontDir, err => {
      if (err) return next(err)

      res.sendStatus(204)
    })
  })
}


module.exports.getGlyphs = function(req, res, next) {
  const owner = req.params.owner
  const fontnames = req.params.fontstack.split(',')



}


module.exports.getThumbnail = function(req, res, next) {

}
