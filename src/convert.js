const {execSync} = require('child_process')
const {existsSync, writeFileSync} = require('fs')
const {prompt} = require('inquirer')
const {resolve} = require('path')
const {parse, toScrapbox} = require('@jigsaw/html2sb-compiler')
const request = require('request')
const Gyazo = require('gyazo-api')
const {gyazo_token, project_name} = require('../.config.json')

const client = new Gyazo(gyazo_token)
const targetMonth = process.argv[2]
const progressFilename = resolve(__dirname, `../data/${targetMonth}-prog.json`)
const originalFilename = resolve(__dirname, `../data/${targetMonth}-orig.json`)

const main = async () => {
  let posts
  if (existsSync(progressFilename)) posts = require(progressFilename)
  else if (existsSync(originalFilename)) posts = require(originalFilename)
  else {
    console.log('Progress and original file not found.\nFetch\'em first!!')
    process.exit(1)
  }
  while (1) {
    const {action} = await prompt({
      type: 'list',
      name: 'action',
      message: `What\'s next? (${posts.length})`,
      choices: ['next', 'finish']
    })
    if (action === 'finish') break
    const post = posts.shift()
    const res = await Promise.all(post.photos.map(
      photo => client.upload(request(photo.original_size.url))
    ))
    try {
      const parsed = parse(post.caption)
      let lines = []
      if (parsed.length > 0) {
        lines = toScrapbox(parse(post.caption)[0]).lines
      }
      const body = encodeURIComponent(
        res.map(r => `[${r.data.permalink_url}]`).concat(lines).join('\n')
      )
      execSync(
        `open https://scrapbox.io/${project_name}/tumblr-${post.id}?body=${body}`
      )
    } catch (err) {
      console.log(err)
      posts.unshift(post)
    }
  }
  writeFileSync(progressFilename, JSON.stringify(posts))
}

main()
