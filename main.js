/**
 * Desc: Main file for controlling window rendering and backend pipeline communication.
 *
 * Authors:
 *      - Chance Nelson <chance-nelson@nau.edu>
 *      - Austin Kelly <ak678@nau.edu>
 *      - Alex Lacy <al2428@nau.edu>
 */


const { app, BrowserWindow, Menu } = require('electron');
const child_process               = require('child_process');

const ipcMain = require('electron').ipcMain;

var fs = require('fs');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected
let win;

var current_json = {};
var visited_modules  = {
    1: {
        'visited': true,
        'executed': false
    },
    2: {
        'visited': false,
        'executed': false
    },
    3: {
        'visited': false,
        'executed': false
    },
    4: {
        'visited': false,
        'executed': false
    }
};
var current_module   = 1;


function initial() {
    /**
     * Desc: Create the initial window, and set the close handler
     */
    // Create the browser window.
    win = new BrowserWindow({width: 1024, height:768, backgroundColor: '#000'});

    // and load the index.html of the app.
  
    win.loadURL('file:///'+ __dirname + '/src/html/module1.html');


    // Open the DevTools.
    // win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('close', function(e){
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
        var choice = require('electron').dialog.showMessageBox(this,
        {
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'Confirm',
            message: 'Are you sure you want to quit?'
        });
        if(choice == 1){
            e.preventDefault();
        }
        win = null;
    });
}

function goToModule(module_number) {
    /**
    * Desc: Load and render a module page
    *
    * Args:
    *      module_number (int): module number to load. Also affects which html file is loaded.
    *
    * Returns:
    *      - If there is a problem rendering the page, False.
    *      - Else, True.
    */

    const options = {
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultid: 1,
        title: 'Question',
        message: 'Are you sure you want to go back?',
        detail: 'Progress on current module will be lost.'
    };
    let response;

    if(module_number < current_module) {
        require('electron').dialog.showMessageBox(null, options,(response) => {
          console.log(response);
        });
    }

    if((current_module <= module_number) && !visited_modules[module_number]['executed']) {
        return false;
    }

    // Load the html
    if (response == 0){
        win.loadURL('file:///' + __dirname + '/src/html/module' + module_number.toString() + '.html');
    }

    current_module = module_number;

    return true;
}


function execPipeline(cmd, args, callback) {
    /**
     * Desc: Execute a pipeline command with some arguments.
     *
     * Args:
     *      cmd (string): name of the pipeline script to call
     *      args (JSON): JSON object of what to throw at the command
     *      callback (function (res)): callback function to get result, see Returns
     *
     * Returns:
     *      - If pipeline returns an error string, return the error string
     *      - Else, return null
     */
    args_json = JSON.parse(args);

    // Merge current args into current json
    for(key in args_json) {
        current_json[key] = args_json[key];
    }

    fs.writeFileSync(__dirname + '/args.json', current_json.toString());

    child_process.exec('python ' + __dirname + '/src/pipeline/' + cmd + ' ' + __dirname + '/args.json', (error, stdout, stderr) => {
        console.log(stdout);

        if(stdout) {
            console.log("Encountered error:", stdout);
            callback(stdout);

        } else {
            // Read back in file
            data = fs.readFileSync(__dirname + '/args.json', 'utf-8');

            current_json = JSON.parse(data.toString());
            callback(null);
        }
    });
}


/* CORE WINDOW EVENTS */

app.on('ready', initial);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    initial();
  }
});





/* IPC EVENTS */

// Attempt to load a page
ipcMain.on('LOADMODULE', (event, module_number) =>  {
    if(goToModule(module_number)) {
        // Send IPC message with the arguments to the current module
        console.log('page load', module_number);
        win.webContents.once('dom-ready', () => {
            win.webContents.send('NEW', [pipeline_args[module_number], pipeline_results[module_number-1]]);
        });
    } else {
        event.sender.send('LOADMODULE', 'DENIED');
    }
});

// Attempt to execute pipeline with args
ipcMain.on('EXECUTE', (event, data) => {
    console.log('execute with args:', data);
    execPipeline(data[0], data[1], (result) => {
        console.log("results:", pipeline_results);
        event.sender.send('EXECUTE', result);
    });
})

// Menu Setup and Customization

const template = [
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'delete' },
      { role: 'selectall' },
      { type: 'separator' },
      { label: 'Restore Defaults', role: 'reload'}

    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    role: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Documentation',
        click () { require('electron').shell.openExternal('https://github.com/PathLabs/primacy_demo/blob/master/README.md') }
      },
      {
        label: 'Website',
        click () { require('electron').shell.openExternal('https://www.cefns.nau.edu/capstone/projects/CS/2019/PathLab-S19/index.html') }
      }
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  });

  // Edit menu
  template[1].submenu.push(
    { type: 'separator' },
    {
      label: 'Speech',
      submenu: [
        { role: 'startspeaking' },
        { role: 'stopspeaking' }
      ]
    }
  );

  // Window menu
  template[3].submenu = [
    { role: 'close' },
    { role: 'minimize' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'front' }
  ];
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
