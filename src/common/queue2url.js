const {project_name} = require('../../.config.json')

const zpad = n => n.toString().length === 1 ? `0${n}` : n.toString()

module.exports = queue => {
  const now = new Date()
  const date = `${now.getFullYear()}${zpad(now.getMonth() + 1)}${zpad(now.getDate())}\n`
  return `https://scrapbox.io/${project_name}/tumblr-${queue.post.id}?body=${queue.body}%0A%23${date}%0A`
}
