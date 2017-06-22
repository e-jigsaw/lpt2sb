const {format} = require('url')
const {resolve} = require('path')
const {readdirSync, writeFileSync} = require('fs')
const {app, BrowserWindow, ipcMain} = require('electron')
const Config = require('electron-config')
const post2sb = require('../common/post2sb.js')
const queue2url = require('../common/queue2url.js')

const config = new Config({
  defaults: {
    bounds: {
      width: 800,
      height: 600
    }
  }
})

let mainWindow, filename, posts, queue
app.on('ready', () => {
  const {x, y, width, height} = config.get('bounds')
  const updateBounds = event => config.set('bounds', mainWindow.getBounds())
  mainWindow = new BrowserWindow({
    title: 'lpt2sb',
    x, y, width, height
  })
  mainWindow.loadURL(`file://${resolve(__dirname, './index.html')}`)
  mainWindow.on('closed', () => (mainWindow = null))
  mainWindow.on('resize', updateBounds)
  mainWindow.on('move', updateBounds)
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('files', readdirSync(resolve(
      __dirname, '../../data'
    )))
  })
  ipcMain.on('file-selected', (event, file) => {
    filename = resolve(__dirname, `../../data/${file}`)
    const data = require(filename)
    posts = data.posts
    queue = data.queue
    mainWindow.webContents.send('selected-file', '')
  })
  const save = () => writeFileSync(filename, JSON.stringify({posts, queue}))
  const check = async () => {
    if (queue.length < 10) {
      const post = posts.shift()
      const body = await post2sb(post)
      queue.push({post, body})
      save()
      if (posts.length > 0) check()
    }
  }
  ipcMain.on('next', () => {
    check()
    if (queue.length > 0) {
      const data = queue.shift()
      mainWindow.webContents.send('open', queue2url(data))
      save()
    }
  })
})
app.on('window-all.closed', () => app.quit())
