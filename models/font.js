const mongoose = require('mongoose')
const select = require('mongoose-json-select')


const FontSchema = new mongoose.Schema({
  fontname: String,
  owner: String,
  familyName: String,
  styleName: String,
  coverages: [{
    name: String,
    id: String,
    count: Number,
    total: Number,
    _id: false
  }],
}, { timestamps: true })

FontSchema.plugin(select, '-_id -__v')

FontSchema.index({owner: 1})
FontSchema.index({owner: 1, spriteId: 1}, {unique: true})


module.exports = mongoose.model('Font', FontSchema)
