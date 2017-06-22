const {parse, toScrapbox} = require('@jigsaw/html2sb-compiler')
const Gyazo = require('gyazo-api')
const request = require('request')
const {gyazo_token} = require('../../.config.json')

const client = new Gyazo(gyazo_token)

module.exports = post => new Promise(async resolve => {
  const res = await Promise.all(post.photos.map(
    photo => client.upload(request(photo.original_size.url))
  ))
  const parsed = parse(post.caption)
  let lines = []
  if (parsed.length > 0) {
    lines = toScrapbox(parse(post.caption)[0]).lines
  }
  resolve(encodeURIComponent(
    res
      .map(r => `[${r.data.permalink_url}]`)
      .concat(lines)
      .concat(['', '', ''])
      .join('\n')
  ))
})
