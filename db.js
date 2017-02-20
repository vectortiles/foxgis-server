const mongoose = require('mongoose')


mongoose.connect('mongodb://localhost/foxgis')


mongoose.connection.on('connected', () => {
  console.log('Mongoose connected')
})


mongoose.connection.on('error', err => {
  console.log('Mongoose connection error: ' + err.message)
})


mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected')
})


process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected through app termination')
    process.exit(0)
  })
})


module.exports = mongoose
