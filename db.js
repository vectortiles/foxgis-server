const mongoose = require('mongoose')


const db = 'mongodb://localhost/foxgis'

mongoose.connect(db)

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${db}`)
})

mongoose.connection.on('error', err => {
  console.log(`Mongoose connection error: ${err.message}`)
})

mongoose.connection.on('disconnected', () => {
  console.log(`Mongoose disconnected to ${db}`)
})

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected through app termination')
    process.exit(0)
  })
})


module.exports = mongoose
