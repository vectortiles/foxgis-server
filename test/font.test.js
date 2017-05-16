const test = require('tape')
const app = require('../app')
const request = require('supertest')(app)


test('Font API test', t => {
  var fontname

  t.test('Create a font', t => {
    request
      .put('/api/v1/fonts/test')
      .attach('font', './test/fixtures/arial.ttf')
      .expect(200)
      .end((err, res) => {
        t.error(err)


        t.end()
      })
  })
})
