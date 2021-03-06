const mongoose = require('mongoose')
const select = require('mongoose-json-select')
const shortid = require('shortid')


const SpriteSchema = new mongoose.Schema({
  spriteId: { type: String, default: shortid.generate },
  owner: { type: String, required: true },
  name: { type: String, default: 'Sprite' },
  description: String
}, { timestamps: true })

SpriteSchema.plugin(select, '-_id -__v')

SpriteSchema.index({ owner: 1 })
SpriteSchema.index({ owner: 1, spriteId: 1 }, { unique: true })


module.exports = mongoose.model('Sprite', SpriteSchema)
