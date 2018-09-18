const electron = require('electron')
const path = require('path')
const remote = electron.remote
const ipc = electron.ipcRenderer
const Store = require('electron-store')
const store = new Store()

