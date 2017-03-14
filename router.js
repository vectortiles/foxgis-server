const express = require('express')
const multer = require('multer')
// const users = require('./controllers/user')
// const tokens = require('./controllers/token')
const styles = require('./controllers/style')
const tilesets = require('./controllers/tileset')
const fonts = require('./controllers/font')
const sprites = require('./controllers/sprite')


const router = express.Router()
const upload = multer({
  dest: 'uploads/',
  limits: { fieldSize: 200000000, files: 1 }
})

// User API
// router.get('/users/:username', users.get)
// router.post('/users', users.create)
// router.patch('/users/:username', users.update)
// router.delete('/users/:username', users.delete)

// Token API
// router.get('/tokens/:owner', tokens.list)
// router.get('/tokens/:owner/:tokenId', tokens.get)
// router.post('/tokens/:owner', tokens.create)
// router.get('/tokens/:owner/:tokenId', tokens.update)
// router.get('/tokens/:owner/:tokenId', tokens.delete)

// Style API
router.get('/styles/:owner', styles.list)
router.get('/styles/:owner/:styleId', styles.get)
router.post('/styles/:owner', styles.create)
router.patch('/styles/:owner/:styleId', styles.update)
router.delete('/styles/:owner/:styleId', styles.delete)
router.get('/styles/:owner/:styleId/:z(\\d+)/:x(\\d+)/:y(\\d+):scale(@[1-4]x)?\.:format([\\w\\.]+)', styles.getTile)
router.get('/styles/:owner/:styleId/static/:lon,:lat,:zoom,:bearing?,:pitch?/:width(\\d+)x:height(\\d+):scale(@[1-4]x)?.:format([\\w\\.]+)?', styles.getStatic)
router.get('/styles/:owner/:styleId/html', styles.getHtml)

// Tileset API
router.get('/tilesets/:owner', tilesets.list)
router.get('/tilesets/:owner/:tilesetId', tilesets.get)
router.post('/tilesets/:owner/', upload.any(), tilesets.create)
router.put('/tilesets/:owner/:tilesetId', upload.any(), tilesets.create)
router.patch('/tilesets/:owner/:tilesetId', tilesets.update)
router.delete('/tilesets/:owner/:tilesetId', tilesets.delete)
router.get('/tilesets/:owner/:tilesetId/:z(\\d+)/:x(\\d+)/:y(\\d+).:format([\\w\\.]+)', tilesets.getTile)

// Font API
router.get('/fonts/:owner', fonts.list)
router.get('/fonts/:owner/:fontname', fonts.get)
router.post('/fonts/:owner', upload.any(), fonts.create)
router.delete('/fonts/:owner/:fontname', fonts.delete)
router.get('/fonts/:owner/:fontstack/:start-:end.pbf', fonts.getGlyphs)

// Sprite API
router.get('/sprites/:owner', sprites.list)
router.get('/sprites/:owner/:spriteId', sprites.get)
router.post('/sprites/:owner', sprites.create)
router.patch('/sprites/:owner/:spriteId', sprites.update)
router.delete('/sprites/:owner/:spriteId', sprites.delete)
router.put('/sprites/:owner/:spriteId/icons/:icon', upload.any(), sprites.createIcon)
router.delete('/sprites/:owner/:spriteId/icons/:icon', sprites.deleteIcon)
router.get('/sprites/:owner/:spriteId/sprite:scale(@[1-4]x)?.:format(png|json)?', sprites.getSprite)


module.exports = router
