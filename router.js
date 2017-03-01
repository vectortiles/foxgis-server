const express = require('express')
const multer = require('multer')
const fonts = require('./controllers/font')
const sprites = require('./controllers/sprite')


const router = express.Router()
const upload = multer({
  dest: 'uploads/',
  limits: { fieldSize: 200000000, files: 1 }
})

// Font API
router.get('/fonts/:username', fonts.list)
router.get('/fonts/:username/:fontname', fonts.get)
router.post('/fonts/:username', upload.any(), fonts.create)
router.delete('/fonts/:username/:fontname', fonts.delete)
router.get('/fonts/:username/:fontstack/:range.pbf', fonts.getGlyphs)
router.get('/fonts/:username/:fontname/thumbnail', fonts.getThumbnail)

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
