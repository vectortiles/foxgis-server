const path = require('path')
const url = require('url')
const _ = require('lodash')
const sharp = require('sharp')
const request = require('request')
const mbgl = require('@mapbox/mapbox-gl-native')
const SphericalMercator = require('@mapbox/sphericalmercator')
const mapbox = require('./mapbox')
const Style = require('../models/style')


module.exports.list = function(req, res, next) {
  const owner = req.params.owner
  const fields = 'styleId owner name description version createdAt updatedAt'

  Style.find({ owner }, fields, (err, styles) => {
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
  const owner = req.params.owner
  const styleId = req.params.styleId
  const z = +req.params.z
  const x = +req.params.x
  const y = +req.params.y
  const scale = +(req.params.scale || '@1x').slice(1, 2)
  const format = req.params.format || 'png'
  const tileSize = +req.query.tileSize || 512

  const sm = new SphericalMercator({ size: 512 })
  const center = sm.ll([x * 512 + 256, y * 512 + 256], z)

  const options = {
    zoom: z,
    width: 512,
    height: 512,
    center: center,
    bearing: 0,
    pitch: 0,
    format: format,
    scale: scale * tileSize / 512
  }

  Style.findOne({ owner, styleId }, (err, style) => {
    if (err) return next(err)
    if (!style) return res.sendStatus(404)

    render(style.toJSON(), options, (err, buffer, info) => {
      if (err) return next(err)

      res.type(info.format)
      res.send(buffer)
    })
  })
}


module.exports.getStatic = function(req, res, next) {
  const owner = req.params.owner
  const styleId = req.params.styleId
  const options = {
    zoom: +req.params.zoom,
    width: +req.params.width,
    height: +req.params.height,
    center: [+req.params.lon, +req.params.lat],
    bearing: +req.params.bearing || 0,
    pitch: +req.params.pitch || 0,
    format: req.params.format || 'png',
    scale: +(req.params.scale || '@1x').slice(1, 2)
  }
console.log(req.params)
  Style.findOne({ owner, styleId }, (err, style) => {
    if (err) return next(err)
    if (!style) return res.sendStatus(404)

    render(style.toJSON(), options, (err, buffer, info) => {
      if (err) return next(err)

      res.type(info.format)
      res.send(buffer)
    })
  })
}


module.exports.getHtml = function(req, res, next) {
  const urlObject = url.parse(req.originalUrl)
  urlObject.protocol = req.protocol
  urlObject.host = req.get('X-Forwarded-Host') || req.get('Host')
  urlObject.pathname = path.dirname(urlObject.pathname)

  const style = url.format(urlObject)
  res.render('index', { style })
}


function render(style, options, callback) {
  const mapOptions = {
    request: (req, callback) => {
      switch (req.kind) {
        case mbgl.Resource.Style:
          req.url = mapbox.normalizeStyleURL(req.url)
          break
        case mbgl.Resource.Source:
          req.url = mapbox.normalizeSourceURL(req.url)
          break
        case mbgl.Resource.Tile:
          req.url = mapbox.normalizeTileURL(req.url)
          break
        case mbgl.Resource.Glyphs:
          req.url = mapbox.normalizeGlyphsURL(req.url)
          break
        case mbgl.Resource.SpriteImage:
          req.url = mapbox.normalizeSpriteURL(req.url)
          break
        case mbgl.Resource.SpriteJSON:
          req.url = mapbox.normalizeSpriteURL(req.url)
          break
      }

      request.get(req.url, { gzip: true, encoding: null }, (err, res, body) => {
        callback(err, { data: body })
      })
    },

    ratio: options.scale
  }

  const map = new mbgl.Map(mapOptions)
  map.load(style)
  map.render(options, (err, buffer) => {
    map.release()
    if (err) return callback(err)

    const image = sharp(buffer, {
      raw: {
        width: Math.round(options.width * mapOptions.ratio),
        height: Math.round(options.width * mapOptions.ratio),
        channels: 4
      }
    })

    try {
      image.toFormat(options.format).toBuffer(callback)
    } catch (e) {   // catch the unsupported format error
      callback(e)
    }
  })
}
