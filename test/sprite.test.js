const test = require('tape')
const fs = require('fs')
const app = require('../app')
const request = require('supertest')(app)


test('Sprite API test', t => {
  var spriteId

  t.test('Create a sprite', t => {
    request
      .post('/api/v1/sprites/test')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.owner, 'test')
        t.ok(res.body.spriteId)
        spriteId = res.body.spriteId

        t.end()
      })
  })

  t.test('List sprites', t => {
    request
      .get('/api/v1/sprites/test')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.ok(res.body.find(sprite => sprite.spriteId === spriteId))

        t.end()
      })
  })

  t.test('Get a sprite', t => {
    request
      .get(`/api/v1/sprites/test/${spriteId}`)
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.owner, 'test')
        t.equal(res.body.spriteId, spriteId)

        t.end()
      })
  })

  t.test('Update a sprite', t => {
    request
      .patch(`/api/v1/sprites/test/${spriteId}`)
      .send({ owner: 'test2', name: 'Sprite2', description: 'aaa' })
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.owner, 'test')
        t.equal(res.body.spriteId, spriteId)
        t.equal(res.body.name, 'Sprite2')
        t.equal(res.body.description, 'aaa')

        t.end()
      })
  })

  t.test('Create a sprite icon', t => {
    request
      .put(`/api/v1/sprites/test/${spriteId}/icons/marker`)
      .attach('icon', './test/fixtures/airfield-11.svg')
      .expect(204)
      .end(t.end)
  })

  t.test('Get a sprite json', t => {
    request
      .get(`/api/v1/sprites/test/${spriteId}/sprite.json`)
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.deepEqual(res.body, require('./expected/sprite.json'))

        t.end()
      })
  })

  t.test('Get a sprite @2x json', t => {
    request
      .get(`/api/v1/sprites/test/${spriteId}/sprite@2x.json`)
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.deepEqual(res.body, require('./expected/sprite@2x.json'))

        t.end()
      })
  })

  t.test('Get a sprite png', t => {
    request
      .get(`/api/v1/sprites/test/${spriteId}/sprite.png`)
      .expect(200)
      .expect('Content-Type', 'image/png')
      .end((err, res) => {
        t.error(err)

        t.ok(res.body.equals(fs.readFileSync('./test/expected/sprite.png')))

        t.end()
      })
  })

  t.test('Get a sprite @2x png', t => {
    request
      .get(`/api/v1/sprites/test/${spriteId}/sprite@2x.png`)
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.ok(res.body.equals(fs.readFileSync('./test/expected/sprite@2x.png')))

        t.end()
      })
  })

  t.test('Delete a sprite icon', t => {
    request
      .delete(`/api/v1/sprites/test/${spriteId}/icons/marker`)
      .expect(204)
      .end((err) => {
        t.error(err)

        request
          .get(`/api/v1/sprites/test/${spriteId}/sprite`)
          .expect(200)
          .end((err, res) => {
            t.error(err)

            t.notOk(res.body.marker)

            t.end()
          })
      })
  })

  t.test('Delete a sprite', t => {
    request
      .delete(`/api/v1/sprites/test/${spriteId}`)
      .expect(204)
      .end((err) => {
        t.error(err)

        request
          .get(`/api/v1/sprites/test/${spriteId}`)
          .expect(404)
          .end(t.end)
      })
  })
})

test.onFinish(() => process.exit(0))
