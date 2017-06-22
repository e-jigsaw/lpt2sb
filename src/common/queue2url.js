const {project_name} = require('../../.config.json')

module.exports = queue =>
  `https://scrapbox.io/${project_name}/tumblr-${queue.post.id}?body=${queue.body}`
