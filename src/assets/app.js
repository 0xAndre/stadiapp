let currentLanguage
const ipc = require('electron').ipcRenderer
const shell = require('electron').shell

ipc.on('sendlanguage', (event, language) => {
    currentLanguage = language
    document.getElementsByClassName('wv')[0].src = `https://stadia.google.com/home?hl=${language}`
})

ipc.on('settings', (event, settings) => {
    document.getElementById('version').innerText = settings.version
    document.getElementById('releaseDate').innerText = settings.releaseDate
    document.getElementById('link').onclick = () => { shell.openExternal(settings.githubUrl) }
})