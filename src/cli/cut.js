const {writeFileSync} = require('fs')
const {resolve} = require('path')

const filename = resolve(__dirname, `../../data/${process.argv[2]}-prog.json`)

const posts = require(filename).slice(parseInt(process.argv[3]))

writeFileSync(filename, JSON.stringify(posts))
