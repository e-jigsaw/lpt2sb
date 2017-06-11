const tumblr = require('tumblr.js')
const {promisify} = require('util')
const {writeFileSync} = require('fs')

const client = tumblr.createClient(require('../.config.json'))
const targetMonth = new Date().getMonth() - 1
const filteredPosts = []

const fetch = offset => new Promise(async resolve => {
  const result = await promisify(client.blogPosts).bind(client)(
    'tumblr.jgs.me', {
      type: 'photo',
      offset
    }
  )
  return resolve(result.posts)
})

const main = async () => {
  let offset = 0
  while (1) {
    const posts = await fetch(offset)
    let isFinish = false
    posts.forEach(({date, id, caption, short_url, photos}) => {
      const postedMonth = new Date(date).getMonth()
      console.log(targetMonth, postedMonth)
      if (postedMonth === targetMonth) filteredPosts.push({
        id, date, caption, short_url, photos
      })
      else if (postedMonth < targetMonth) isFinish = true
    })
    if (isFinish) break
    console.log(offset, filteredPosts.length)
    offset += 20
  }
  writeFileSync(`./data/${targetMonth + 1}-orig.json`, JSON.stringify(filteredPosts))
}

main()
