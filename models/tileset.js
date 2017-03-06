const mongoose = require('mongoose')
const select = require('mongoose-json-select')
const shortid = require('shortid')


const TilesetSchema = new mongoose.Schema({
  tilesetId: { type: String, default: shortid.generate },
  owner: String,
  name: String,
  description: String,
  complete: { type: Boolean, default: true},
  progress: { type: Number, default: 0},
  error: String
}, { timestamps: true })

TilesetSchema.plugin(select, '-_id -__v')

TilesetSchema.index({ owner: 1 })
TilesetSchema.index({ owner: 1, tilesetId: 1 }, { unique: true })


module.exports = mongoose.model('Tileset', TilesetSchema)
