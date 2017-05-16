const path = require('path')
const express = require('express')
const compression = require('compression')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const cors = require('cors')
const router = require('./router')


// Connect to db
require('./db')

const app = express()
app.set('json spaces', 2)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.use(compression())
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride())
app.use(cookieParser())
app.use(express.static('public'))

app.use('/api/v1', router)

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err.stack && err.stack.split('\n') : undefined
  })
})


module.exports = app
