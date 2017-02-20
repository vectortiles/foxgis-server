const router = require('express').Router()
const styles = require('./controllers/style')
const tilesets = require('./controllers/tileset')
const fonts = require('./controllers/font')
const sprites = require('./controllers/sprite')


router.get('/styles/:owner', styles.list)
router.get('/styles/:owner/:style_id', styles.retrieve)
router.post('/styles/:owner', styles.create)
router.patch('/styles/:owner/:style_id', styles.update)
router.delete('/styles/:owner/:style_id', styles.delete)
router.get('/styles/:owner/:style_id/:z(\\d+)/:x(\\d+)/:y(\\d+):scale(@[1-4]x)?\.:format([\\w\\.]+)', styles.downloadTile)
router.get('/styles/:owner/:style_id/thumbnail', styles.preview)


router.get('/tilesets', tilesets.listAll)
router.get('/tilesets/:owner', tilesets.list)
router.get('/tilesets/:owner/:tileset_id', tilesets.retrieve)
router.post('/tilesets/:owner', tilesets.upload)
router.get('/tilesets/:owner/:tileset_id/status', tilesets.getCopyStatus)
router.patch('/tilesets/:owner/:tileset_id', tilesets.update)
router.delete('/tilesets/:owner/:tileset_id', tilesets.delete)
router.get('/tilesets/:owner/:tileset_id/:z(\\d+)/:x(\\d+)/:y(\\d+):scale(@[1-4]x)?\.:format([\\w\\.]+)', tilesets.downloadTile)
router.get('/tilesets/:owner/:tileset_id/raw', tilesets.downloadRaw)


router.get('/fonts/:owner', fonts.list)
router.get('/fonts/:owner/:fontname', fonts.retrieve)
router.post('/fonts/:owner', fonts.upload)
router.patch('/fonts/:owner/:fontname', fonts.update)
router.delete('/fonts/:owner/:fontname', fonts.delete)
router.get('/fonts/:owner/:fontname/:range.pbf', fonts.download)
router.get('/fonts/:owner/:fontname/raw', fonts.downloadRaw)
router.get('/fonts/:owner/:fontname/thumbnail', fonts.preview)


router.get('/sprites', sprites.listAll)
router.get('/sprites/:owner', sprites.list)
router.get('/sprites/:owner/:sprite_id', sprites.retrieve)
router.post('/sprites/:owner', sprites.upload)
router.put('/sprites/:owner/:sprite_id/:icon', sprites.uploadIcon)
router.patch('/sprites/:owner/:sprite_id', sprites.update)
router.delete('/sprites/:owner/:sprite_id', sprites.delete)
router.delete('/sprites/:owner/:sprite_id/:icon', sprites.deleteIcon)
router.get('/sprites/:owner/:sprite_id/sprite:scale(@[1-4]x)?.:format([\\w\\.]+)?', sprites.download)
router.get('/sprites/:owner/:sprite_id/raw', sprites.downloadRaw)
router.get('/sprites/:owner/:sprite_id/:icon', sprites.downloadIcon)


module.exports = router
