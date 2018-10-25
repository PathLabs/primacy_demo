const electron = require('electron')
// const tabGroup = require("electron-tabs");
const app = electron.app

const BrowserWindow = electron.BrowserWindow
var mainWindow

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 1024, height:768, backgroundColor: '#000'})
  mainWindow.loadURL('file:///'+ __dirname + '/index.html')
  console.log('file:///'+ __dirname + '/index.html')
});

// // Initializes tab group //
// let tabGroup = new TabGroup();
// let tab = tabGroup.addTab({
//     title: "Electron",
//     src: "http://electron.atom.io",
//     visible: true
// });
