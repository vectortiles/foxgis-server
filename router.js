const express = require('express')
const multer = require('multer')
const fonts = require('./controllers/font')
const sprites = require('./controllers/sprite')


const router = express.Router()
const upload = multer({
  limits: { fieldSize: 200000000, files: 1 }
})

// Font API
router.get('/fonts/:username', fonts.list)
router.get('/fonts/:username/:fontname', fonts.get)
router.post('/fonts/:username', upload.any(), fonts.create)
router.patch('/fonts/:username/:fontname', fonts.update)
router.delete('/fonts/:username/:fontname', fonts.delete)
router.get('/fonts/:username/:fontstacks/:range.pbf', fonts.getGlyphs)
router.get('/fonts/:username/:fontname/thumbnail', fonts.getThumbnail)

// Sprite API
router.get('/sprites/:owner', sprites.list)
router.get('/sprites/:owner/:sprite_id', sprites.get)
router.post('/sprites/:owner', sprites.create)
router.patch('/sprites/:owner/:sprite_id', sprites.update)
router.delete('/sprites/:owner/:sprite_id', sprites.delete)
router.put('/sprites/:owner/:sprite_id/icons/:icon', upload.any(), sprites.createIcon)
router.delete('/sprites/:owner/:sprite_id/:icon', sprites.deleteIcon)
router.get('/sprites/:owner/:sprite_id/sprite:scale(@[1-4]x)?.:format(png|json)?', sprites.getSprite)


module.exports = router
