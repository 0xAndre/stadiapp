const { app, BrowserWindow, session, globalShortcut, shell } = require('electron')
const Menubar = require('./menu')
const Store = require('electron-store')
const path = require('path')
const store = new Store()

const settings = require('./settings.json')

let mainWindow
let splashWindow
let loginMode = false

app.userAgentFallback = "Chrome"

function createWindow() {
  mainWindow = new BrowserWindow({
    title: `${settings.title} - ${settings.version}`,
    width: 350,
    height: 500,
    resizable: true,
    center: true,
    icon: path.join(__dirname, 'assets/stadia.ico'),
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    }
  })

  splashWindow = new BrowserWindow({
    width: 350,
    height: 500,
    resizable: true,
    frame: false,
    icon: path.join(__dirname, 'assets/stadia.ico'),
  })

  if (!store.get('language')) {
    store.set('language', settings.defaultLanguage)
  }

  splashWindow.loadFile(path.join(__dirname, 'views/splash.html'))

  setTimeout(function () {
    splashWindow.destroy()
    mainWindow.loadFile(path.join(__dirname, 'views/app.html'))
    mainWindow.setMenuBarVisibility(true)


    mainWindow.maximize()

    Menubar(mainWindow)

    mainWindow.on('page-title-updated', (evt) => {
      evt.preventDefault()
    })

    mainWindow.on('enter-full-screen', (evt) => {
      mainWindow.setMenuBarVisibility(false)
    })

    mainWindow.on('leave-full-screen', (evt) => {
      mainWindow.setMenuBarVisibility(true)
    })

    mainWindow.webContents.on('did-finish-load', function () {
      mainWindow.webContents.send('sendlanguage', store.get('language'))
    })
  }, 3000)

}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.url.includes('https://accounts.google.com')) {
      loginMode = true
    } else if (details.url.includes(`https://stadia.google.com/home?hl=${store.get('language')}`)) {
      loginMode = false
    }

    if (loginMode) {
      details.requestHeaders["User-Agent"] = 'Chrome'
    } else {
      details.requestHeaders["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36"
    }

    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })


  globalShortcut.register('Escape', () => {
    mainWindow.setFullScreen(false)
  })

  globalShortcut.register('F11', () => {
    mainWindow.setFullScreen(!mainWindow.isFullScreen())
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})



