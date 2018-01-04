const {promisify} = require('util')
const {writeFileSync} = require('fs')
const {resolve} = require('path')
const tumblr = require('tumblr.js')
const {DateTime} = require('luxon')

const client = tumblr.createClient(require('../../.config.json'))
const startDateTime = DateTime.local().minus({month: 1}).startOf('month')
const endDateTime = DateTime.local().minus({month: 1}).endOf('month')
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
      const postedDateTime = DateTime.fromISO(new Date(date).toISOString())
      if (startDateTime < postedDateTime && endDateTime > postedDateTime) filteredPosts.push({
        id, date, caption, short_url, photos
      })
      else if (postedDateTime < startDateTime) isFinish = true
    })
    if (isFinish) break
    console.log(offset, filteredPosts.length)
    offset += 20
  }
  writeFileSync(
    resolve(__dirname, `../../data/${startDateTime.month}-orig.json`),
    JSON.stringify(filteredPosts)
  )
}

main()
