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
