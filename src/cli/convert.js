const {execSync} = require('child_process')
const {existsSync, writeFileSync} = require('fs')
const {resolve} = require('path')
const {prompt} = require('inquirer')
const {project_name} = require('../../.config.json')
const post2sb = require('../common/post2sb.js')

const targetMonth = process.argv[2]
const progressFilename = resolve(
  __dirname, `../../data/${targetMonth}-prog.json`
)
const originalFilename = resolve(
  __dirname, `../../data/${targetMonth}-orig.json`
)

const main = async () => {
  let posts, queue
  if (existsSync(progressFilename)){
    const file = require(progressFilename)
    posts = file.posts
    queue = file.queue
  } else if (existsSync(originalFilename)) {
    posts = require(originalFilename)
    queue = []
  } else {
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
    try {
      const post = posts.shift()
      const body = await post2sb(post)
      execSync(
        `open "https://scrapbox.io/${project_name}/tumblr-${post.id}?body=${body}"`
      )
    } catch (err) {
      console.log(err)
      posts.unshift(post)
    }
  }
  writeFileSync(progressFilename, JSON.stringify({posts, queue}))
}

main()
