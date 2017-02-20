const mongoose = require('mongoose')
const select = require('mongoose-json-select')


const UserSchema = new mongoose.Schema({
  username: { type: String, index: { unique: true } },
  password: String,
  email: String
}, { timestamps: true })

UserSchema.plugin(select, '-_id -__v')


module.exports = mongoose.model('User', UserSchema)
