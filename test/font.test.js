const test = require('tape')
const fs = require('fs')
const app = require('../app')
const request = require('supertest')(app)


test('Font API test', t => {
  t.test('Create a ttf font', t => {
    request
      .put('/api/v1/fonts/test')
      .attach('font', './test/fixtures/ArialUnicodeMS-Regular.ttf')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.fontname, 'Arial Unicode MS Regular')
        t.equal(res.body.owner, 'test')
        t.equal(res.body.familyName, 'Arial Unicode MS')
        t.equal(res.body.styleName, 'Regular')
        t.ok(res.body.coverages)

        t.end()
      })
  })

  t.test('Create a otf font', t => {
    request
      .put('/api/v1/fonts/test')
      .attach('font', './test/fixtures/SourceCodePro-Regular.otf')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.fontname, 'Source Code Pro Regular')
        t.equal(res.body.owner, 'test')
        t.equal(res.body.familyName, 'Source Code Pro')
        t.equal(res.body.styleName, 'Regular')
        t.ok(res.body.coverages)

        t.end()
      })
  })

  t.test('Get a font', t => {
    request
      .get('/api/v1/fonts/test/Arial Unicode MS Regular')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.equal(res.body.fontname, 'Arial Unicode MS Regular')
        t.equal(res.body.owner, 'test')
        t.equal(res.body.familyName, 'Arial Unicode MS')
        t.equal(res.body.styleName, 'Regular')
        t.ok(res.body.coverages)

        t.end()
      })
  })

  t.test('List all fonts', t => {
    request
      .get('/api/v1/fonts/test')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.ok(res.body.find(font => font.fontname === 'Arial Unicode MS Regular'))

        t.end()
      })
  })

  t.test('Get glyphs', t => {
    request
      .get('/api/v1/fonts/test/Arial Unicode MS Regular,Source Code Pro Regular/0-255.pbf')
      .responseType('blob')
      .expect(200)
      .end((err, res) => {
        t.error(err)

        t.ok(res.body.equals(fs.readFileSync('./test/fixtures/0-255.pbf')))

        t.end()
      })
  })

  t.test('Delete a font', t => {
    request
      .delete('/api/v1/fonts/test/Arial Unicode MS Regular')
      .expect(204)
      .end(err => {
        t.error(err)

        request
          .delete('/api/v1/fonts/test/Source Code Pro Regular')
          .expect(204)
          .end(err => {
            t.error(err)

            t.end()
          })
      })
  })
})

test.onFinish(() => process.exit(0))
