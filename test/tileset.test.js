const test = require('tape')
const fs = require('fs')
const app = require('../app')
const request = require('supertest')(app)


test('Tileset API test', t => {
  var tilesetId1
  var tilesetId2

  t.test('Create a geojson tileset', t => {
    request
      .post('/api/v1/tilesets/test')
      .attach('aa', './test/fixtures/ne_110m_admin_0_countries.geojson')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.owner, 'test')
        t.ok(res.body.tilesetId)
        tilesetId1 = res.body.tilesetId

        setTimeout(() => t.end(), 5000)
      })
  })

  t.test('Create a shapefile tileset', t => {
    request
      .post('/api/v1/tilesets/test')
      .attach('aa', './test/fixtures/ne_110m_admin_0_countries.zip')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.owner, 'test')
        t.ok(res.body.tilesetId)
        tilesetId2 = res.body.tilesetId

        setTimeout(() => t.end(), 5000)
      })
  })

  t.test('Replace a tileset', t => {
    request
      .put(`/api/v1/tilesets/test/${tilesetId1}`)
      .attach('aa', './test/fixtures/ne_110m_admin_0_countries.zip')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.owner, 'test')
        t.equal(res.body.tilesetId, tilesetId1)

        setTimeout(() => t.end(), 5000)
      })
  })

  t.test('Get a tileset', t => {
    request
      .get(`/api/v1/tilesets/test/${tilesetId1}`)
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.owner, 'test')
        t.equal(res.body.tilesetId, tilesetId1)
        t.ok(res.body.complete)
        t.notOk(res.body.error)

        t.end()
      })
  })

  t.test('List all tilesets', t => {
    request
      .get('/api/v1/tilesets/test')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.ok(res.body.find(tileset => tileset.tilesetId === tilesetId1))

        t.end()
      })
  })

  t.test('Update a tileset', t => {
    request
      .patch(`/api/v1/tilesets/test/${tilesetId1}`)
      .send({ tilesetId: 'aaa', owner: 'test2', name: 'Tileset', description: 'abc' })
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.owner, 'test')
        t.equal(res.body.tilesetId, tilesetId1)
        t.equal(res.body.name, 'Tileset')
        t.equal(res.body.description, 'abc')

        t.end()
      })
  })

  t.test('Get a tileJSON', t => {
    request
      .get(`/api/v1/tilesets/test/${tilesetId1},${tilesetId2},non_existed/tilejson`)
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.id, `${tilesetId1},${tilesetId2}`)
        t.ok(res.body.vector_layers)

        t.end()
      })
  })

  t.test('Get a tile', t => {
    request
      .get(`/api/v1/tilesets/test/${tilesetId1},${tilesetId2},non_existed/0/0/0.pbf`)
      .responseType('blob')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.ok(res.body.equals(fs.readFileSync('./test/expected/0.pbf')))

        t.end()
      })
  })

  t.test('Delete a tileset', t => {
    request
      .delete(`/api/v1/tilesets/test/${tilesetId1}`)
      .expect(204)
      .end(err => {
        t.error(err)

        request
          .delete(`/api/v1/tilesets/test/${tilesetId2}`)
          .expect(204)
          .end(err => {
            t.error(err)
            t.end()
          })
      })
  })
})

test.onFinish(() => process.exit(0))
