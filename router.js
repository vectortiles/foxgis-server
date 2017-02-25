const express = require('express')
const multer = require('multer')
const sprites = require('./controllers/sprite')


const router = express.Router()
const upload = multer({
  limits: { fieldSize: 200000000, files: 1 }
})

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
