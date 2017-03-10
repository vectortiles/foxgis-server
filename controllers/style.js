const path = require('path')
const url = require('url')
const _ = require('lodash')
const sharp = require('sharp')
const request = require('request')
const mbgl = require('@mapbox/mapbox-gl-native')
const SphericalMercator = require('@mapbox/sphericalmercator')
const mbutil = require('./mapbox')
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
  const owner = req.params.owner
  const styleId = req.params.styleId
  const z = +req.params.z
  const x = +req.params.x
  const y = +req.params.y
  const scale = +(req.params.scale || '@1x').slice(1, 2)
  const format = req.params.format || 'png'
  const tileSize = +req.query.tileSize || 512

  const sm = new SphericalMercator({ size: tileSize })
  const center = sm.ll([x * tileSize + tileSize / 2, y * tileSize + tileSize / 2], z)

  const options = {
    zoom: z,
    width: tileSize,
    height: tileSize,
    center: center,
    bearing: 0,
    pitch: 0,
    format: format,
    scale: scale
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
    pitch: +req.params.bearing || 0,
    format: req.params.format || 'png',
    scale: +(req.params.scale || '@1x').slice(1, 2)
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


module.exports.getHtml = function(req, res, next) {
  const urlObject = url.parse(req.originalUrl)
  urlObject.protocol = req.protocol
  urlObject.host = req.get('host')
  urlObject.pathname = path.dirname(urlObject.pathname)

  const style = url.format(urlObject)
  res.render('index', { style })
}


function render(style, options, callback) {
  const accessToken = 'pk.eyJ1IjoibWFwZXIiLCJhIjoiY2owMXpsMTlhMDNnbDJ3b2x2dGloZGV1aCJ9.mvM8UjjqsDRWolzvhjZoww'

  const mapOptions = {
    request: (req, callback) => {
      switch (req.kind) {
        case mbgl.Resource.Style:
          req.url = mbutil.normalizeStyleURL(req.url, accessToken)
          break
        case mbgl.Resource.Source:
          req.url = mbutil.normalizeSourceURL(req.url, accessToken)
          break
        case mbgl.Resource.Tile:
          req.url = mbutil.normalizeTileURL(req.url)
          break
        case mbgl.Resource.Glyphs:
          req.url = mbutil.normalizeGlyphsURL(req.url, accessToken)
          break
        case mbgl.Resource.SpriteImage:
          req.url = mbutil.normalizeSpriteURL(req.url, `@${options.scale}x`, '.png', accessToken)
          break
        case mbgl.Resource.SpriteJSON:
          req.url = mbutil.normalizeSpriteURL(req.url, `@${options.scale}x`, `.json`, accessToken)
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
        width: options.width * mapOptions.ratio,
        height: options.width * mapOptions.ratio,
        channels: 4
      }
    })

    image.toFormat(options.format).toBuffer(callback)
  })
}
