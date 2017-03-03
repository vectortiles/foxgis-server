const express = require('express')
const multer = require('multer')
const tilesets = require('./controllers/tilesets')
const fonts = require('./controllers/font')
const sprites = require('./controllers/sprite')


const router = express.Router()
const upload = multer({
  dest: 'uploads/',
  limits: { fieldSize: 200000000, files: 1 }
})

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
