const test = require('tape')
const fs = require('fs')
const app = require('../app')
const request = require('supertest')(app)


test('Style API test', t => {
  var styleId

  t.test('Create a style', t => {
    var update = require('./fixtures/streets-v9.json')

    request
      .post('/api/v1/styles/test')
      .send(update)
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.owner, 'test')
        t.ok(res.body.styleId)
        t.equal(res.body.sprite, update.sprite)
        t.equal(res.body.glyphs, update.glyphs)
        t.deepEqual(res.body.sources, update.sources)
        t.deepEqual(res.body.layers, update.layers)
        styleId = res.body.styleId

        t.end()
    })
  })

  t.test('List all styles', t => {
    request
      .get('/api/v1/styles/test')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.ok(res.body.find(style => style.styleId === styleId))

        t.end()
      })
  })

  t.test('Get a style', t => {
    request
      .get(`/api/v1/styles/test/${styleId}`)
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.owner, 'test')
        t.equal(res.body.styleId, styleId)

        t.end()
      })
  })

  t.test('Update a style', t => {
    request
      .patch(`/api/v1/styles/test/${styleId}`)
      .send({ owner: 'test2', styleId: '123', name: 'style', layers: []})
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.owner, 'test')
        t.equal(res.body.styleId, styleId)
        t.equal(res.body.name, 'style')
        t.deepEqual(res.body.layers, [])

        t.end()
      })
  })

  t.test('Replace a style', t => {
    var update = require('./fixtures/style.json')

    request
      .put(`/api/v1/styles/test/${styleId}`)
      .send(update)
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.owner, 'test')
        t.equal(res.body.styleId, styleId)
        t.equal(res.body.name, 'style')
        t.notOk(res.body.sprite)
        t.notOk(res.body.glyphs)
        t.deepEqual(res.body.sources, update.sources)
        t.deepEqual(res.body.layers, update.layers)

        t.end()
      })
  })

  t.test('Get a tile', t => {
    request
      .get(`/api/v1/styles/test/${styleId}/0/0/0@2x.png?tileSize=256`)
      .responseType('blob')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.ok(res.body.equals(fs.readFileSync('./test/expected/0@2x.png')))

        t.end()
      })
  })

  t.test('Get a static image', t => {
    request
      .get(`/api/v1/styles/test/${styleId}/static/0,0,0,90.5,50.5/200x200@2x.png`)
      .responseType('blob')
      .expect(200)
      .end((err, res) => {
        t.error(err)
        console.log(res.body.length, fs.readFileSync('./test/expected/200x200@2x.png').length)
        t.ok(res.body.equals(fs.readFileSync('./test/expected/200x200@2x.png')))

        t.end()
      })
  })

  t.test('Get a html', t => {
    request
      .get(`/api/v1/styles/test/${styleId}/html`)
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end(t.end)
  })

  t.test('Delete a style', t => {
    request
      .delete(`/api/v1/styles/test/${styleId}`)
      .expect(204)
      .end(t.end)
  })
})

test.onFinish(() => process.exit(0))
