const crypto = require('crypto')
const mongoose = require('mongoose')
const select = require('mongoose-json-select')


const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  salt: String,
  hash: String,
  name: String,
  email: String,
  phone: String,
  company: String,
  location: String,
  avatar: Buffer
}, { timestamps: true })

UserSchema.plugin(select, '-_id -__v -salt -hash -avatar')

UserSchema.index({ username: 1 }, { unique: true })

UserSchema.virtual('password').set(function(password) {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('hex')
})

UserSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('hex')
  return this.hash === hash
}


module.exports = mongoose.model('User', UserSchema)
