const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const fs = require('fs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  electron.protocol.registerStreamProtocol('custom',
    (request, respond) => {
      var urlp = url.parse(request.url)
      respond({
        statusCode: 200,
        headers: {'Content-Type': 'text/html'},
        data: fs.createReadStream(path.join(__dirname, urlp.pathname))
      })
    },
    err => {
      if (err) throw new Error(err, 'Failed to create protocol: dat')
    }
  )

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL('custom://foo.com/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // register download handler
  mainWindow.webContents.session.prependListener('will-download', (e, item, webContents) => {
    console.log('will-download')
    let filePath = path.join(__dirname, 'out.html')
    item.setSavePath(filePath)
    item.on('done', (e, state) => {
      console.log('done', state, e)
      // inform users of error conditions
      if (state === 'interrupted') {
        electron.dialog.showErrorBox('Download error', `The download of ${item.getURL()} was interrupted`)
      }

      if (state === 'completed') {
        electron.dialog.showErrorBox('Download completed', `The download of ${item.getURL()} went fine`)
      }
    })
  })

  // trigger download 1 (will succeed)
  mainWindow.webContents.downloadURL('https://github.com/index.html')

  // trigger download 2 (will fail)
  mainWindow.webContents.downloadURL('custom://foo.com/index.html')

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

electron.protocol.registerStandardSchemes(['custom'], { secure: true })

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
