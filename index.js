const TabGroup = require("electron-tabs");


// Initializes tab group //
let tabGroup = new TabGroup();
let tab = tabGroup.addTab({
    title: "Electron",
    src: "http://electron.atom.io",
    visible: true
});
