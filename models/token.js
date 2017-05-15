const mongoose = require('mongoose')
const select = require('mongoose-json-select')
const shortid = require('shortid')


const TokenSchema = new mongoose.Schema({
  tokenId: { type: String, default: shortid.generate },
  owner: { type: String, required: true },
  name: { type: String, default: 'Token' },
  description: String,
  default: Boolean,
  scopes: [String],
  token: String
}, { timestamps: true })

TokenSchema.plugin(select, '-_id -__v')

TokenSchema.index({ owner: 1 })
TokenSchema.index({ owner: 1, tokenId: 1 }, { unique: true })


module.exports = mongoose.model('Token', TokenSchema)
