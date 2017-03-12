const URL = require('url')


const config = {
  API_URL: 'https://api.mapbox.com',
  ACCESS_TOKEN: 'pk.eyJ1IjoibWFwZXIiLCJhIjoiY2owMXpsMTlhMDNnbDJ3b2x2dGloZGV1aCJ9.mvM8UjjqsDRWolzvhjZoww'
}

function makeAPIURL(urlObject, accessToken) {
  urlObject.query.access_token = accessToken || config.ACCESS_TOKEN
  urlObject.host = urlObject.hostname = undefined
  urlObject.search = undefined

  return URL.format(urlObject).replace(/^mapbox:\/\//, config.API_URL)
}


module.exports.normalizeStyleURL = function(url, accessToken) {
  const urlObject = URL.parse(url, true, true)
  if (urlObject.protocol !== 'mapbox:') return url

  urlObject.pathname = '/styles/v1' + urlObject.pathname

  return makeAPIURL(urlObject, accessToken)
}


module.exports.normalizeGlyphsURL = function(url, accessToken) {
  const urlObject = URL.parse(url, true, true)
  if (urlObject.protocol !== 'mapbox:') return url

  urlObject.pathname = '/fonts/v1' + urlObject.pathname

  return makeAPIURL(urlObject, accessToken)
}


module.exports.normalizeSourceURL = function(url, accessToken) {
  const urlObject = URL.parse(url, true, true)
  if (urlObject.protocol !== 'mapbox:') return url

  urlObject.pathname = '/v4/' + urlObject.hostname + '.json'
  urlObject.query.secure = true

  return makeAPIURL(urlObject, accessToken)
}


module.exports.normalizeSpriteURL = function(url, accessToken) {
  const urlObject = URL.parse(url, true, true)
  if (urlObject.protocol !== 'mapbox:') return url

  urlObject.pathname = '/styles/v1' + urlObject.pathname.replace(/(@[1-4]x)?\.(png|json)$/, '/sprite$&')

  return makeAPIURL(urlObject, accessToken)
}


module.exports.normalizeTileURL = function(url, accessToken) {
  const urlObject = URL.parse(url, true, true)
  if (urlObject.protocol !== 'mapbox:') return url

  urlObject.pathname = '/v4' + urlObject.pathname

  return makeAPIURL(urlObject, accessToken)
}
