const mongoose = require('mongoose')
const select = require('mongoose-json-select')
const shortid = require('shortid')


const SpriteSchema = new mongoose.Schema({
  spriteId: { type: String, default: shortid.generate, index: true },
  owner: String,
  name: { type: String, default: 'sprite'},
  description: String
}, { timestamps: true })


SpriteSchema.plugin(select, '-_id -__v')


module.exports = mongoose.model('Sprite', SpriteSchema)
