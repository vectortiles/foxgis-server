const mongoose = require('mongoose')
const select = require('mongoose-json-select')
const shortid = require('shortid')


const StyleSchema = new mongoose.Schema({
  styleId: { type: String, default: shortid.generate },
  owner: String,
  name: String,
  description: String,
  version: { type: Number, default: 8 },
  metadata: mongoose.Schema.Types.Mixed,
  center: [Number],
  zoom: Number,
  bearing: Number,
  pitch: Number,
  light: {
    anchor: String,
    position: [Number],
    color: String,
    intensity: Number
  },
  sources: mongoose.Schema.Types.Mixed,
  sprite: String,
  glyphs: String,
  transition: {
    duration: Number,
    delay: Number
  },
  layers: [mongoose.Schema.Types.Mixed]
}, { timestamps: true })

StyleSchema.plugin(select, '-_id -__v')

StyleSchema.index({ owner: 1 })
StyleSchema.index({ owner: 1, tilesetId: 1 }, { unique: true })


module.exports = mongoose.model('Style', StyleSchema)
