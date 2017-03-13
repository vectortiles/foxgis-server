const mongoose = require('mongoose')
const select = require('mongoose-json-select')


const FontSchema = new mongoose.Schema({
  fontname: String,
  owner: { type: String, required: true },
  familyName: String,
  styleName: String,
  coverages: [{
    language: String,
    code: String,
    percentage: Number,
    _id: false
  }],
}, { timestamps: true })

FontSchema.plugin(select, '-_id -__v')

FontSchema.index({ owner: 1 })
FontSchema.index({ owner: 1, fontname: 1 }, { unique: true })


module.exports = mongoose.model('Font', FontSchema)
