/**
 * Desc: Main file for controlling window rendering and backend pipeline communication.
 *
 * Authors:
 *      - Chance Nelson <chance-nelson@nau.edu>
 *      - Austin Kelly <ak678@nau.edu>
 *      - Alex Lacy <al2428@nau.edu>
 */


const { app, BrowserWindow, Menu } = require('electron');
const child_process                = require('child_process');

const ipcMain = require('electron').ipcMain;

const {dialog} = require('electron');

var fs = require('fs');

const tar = require('tar');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected
let win;
let viz;

// get the PID of our current process, for sandboxing uses
let pid = process.pid;

// create a run prefix directory
let prefix = __dirname + '/pipeline/' + pid.toString();
fs.mkdirSync(prefix);

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

    let response = 0;

    const options = {
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultid: 1,
        title: 'Question',
        message: 'Are you sure you want to leave?',
        detail: 'Progress on current module will be lost.'
    };

    if(module_number <= current_module) {
        response = require('electron').dialog.showMessageBox(null, options,(response) => {
          if (response == 0){
              win.loadURL('file:///' + __dirname + '/src/html/module' + module_number.toString() + '.html');
          }
        });
    }

    if(module_number == 1) {
        current_module = module_number;
        return true;
    }

    if(!visited_modules[module_number-1]['executed']){
        return false;
    }

    if((current_module <= module_number) && !visited_modules[module_number-1]['executed']) {
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

    let response = 0;

    const options = {
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultid: 1,
        title: 'Question',
        message: 'Executing will remove progress on future modules',
        detail: 'Progress on future modules will be lost. Save your state in file->save'
    };

    let most_forward_exec = 1;
    while(true) {
        if(visited_modules[most_forward_exec]['executed']) {
            if(most_forward_exec == 3) break;
            most_forward_exec++;

        } else {
            most_forward_exec--;
            break;
        }
    }

    console.log("checking most forward exec");
    console.log(most_forward_exec, current_module);

    if(most_forward_exec > current_module) {
        response = require('electron').dialog.showMessageBox(null, options,(response) => {
            if (response != 0){
                return;
            }

            // Upon execution, purge the current args of any information for future
            // modules. We won't need them, since we're rerunning a previous segment
            // Also, reset the state information in visited_modules to match
            console.log("processing cmd:", cmd);
            switch(cmd) {
                case 'primacy primer-collection':
                    delete current_json['primer_scores'];
                    delete current_json['set_optimization'];
                    console.log('remove arguments:');
                    console.log(args)
                    visited_modules = {
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

                case 'primacy primer-score':
                    delete current_json['set_optimization'];
                    visited_modules = {
                        1: {
                            'visited': true,
                            'executed': true
                        },
                        2: {
                            'visited': true,
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
            }

            // Re-enter execPipeline with new, cleaned state
            execPipeline(cmd, args, callback);
        });
    } else {
        fs.writeFileSync(prefix + '/args.json', JSON.stringify(current_json));

        cmd = cmd + ' ' + prefix + '/args.json'
        if(!cmd.includes('primer-score')) {
            cmd += ' ' + prefix;
        }

        console.log(cmd);

        child_process.exec(cmd, (error, stdout, stderr) => {
            // Read back in file
            data = fs.readFileSync(prefix + '/args.json', 'utf-8');

            console.log(data.toString());

            current_json = JSON.parse(data.toString());

            visited_modules[current_module]['executed'] = true;

            callback(null);
        });
    }
}

function updateArgs(new_args) {
    let new_args_json = JSON.parse(new_args);
    console.log(new_args_json);

    for(key in new_args_json) {
        console.log(key)
        current_json[key] = new_args_json[key];
    }

    console.log(current_json)
}

function showViz(viz_num) { 
    switch(viz_num) {
        case 1: 
            if(!visited_modules[1].executed) return false;
            break;
        
        case 2: 
            if(!visited_modules[2].executed) return false;
            break;
    }

    viz = new BrowserWindow({width: 1024, height:768, backgroundColor: '#000'});

    viz.on('closed', function() {
        viz = null;
    });

    viz.loadURL('file:///' + __dirname + '/src/html/module' + viz_num.toString() + '_viz.html');
    
    viz.webContents.once('dom-ready', () => {
        viz.webContents.send('NEW', JSON.stringify(current_json));
    });

    return true;
}


/**
 * @brief create a save of the current pipeline state
 *
 * @param save_state_path file path to the tarball to save
 */
function createSaveState(save_state_path) {
    // save the current state to args.json
    fs.writeFileSync(prefix + '/args.json', JSON.stringify(current_json));
    fs.writeFileSync(prefix + '/state.json', JSON.stringify(visited_modules));

    // get a list of all files and directories making up the current state
    let state_files = fs.readdirSync(prefix);

    tar.c({gzip: true, file: save_state_path, cwd: prefix}, state_files);
}


/**
 * @brief load a save state into the current pipeline state
 *
 * @param save_state_path file path to the saved tarball
 */
function loadSaveState(save_state_path) {
    // clear out all files in the current state
    let state_files = fs.readdirSync(prefix);
    
    for(let file of state_files) {
        fs.unlink(prefix + file.toString(), err => {
            if(err) console.log(err);
        });
    }

    // extract the state files 
    tar.x({file: save_state_path, cwd: prefix, sync: true});

    // Load in the args and state json files
    current_json = JSON.parse(fs.readFileSync(prefix + '/args.json'));
    visited_modules = JSON.parse(fs.readFileSync(prefix + '/state.json'));

    // Find the most recently visited module
    current_module = 1;

    while(visited_modules[current_module['executed']]) {
        current_module++;
    }

    // Jump to the most recent module
    goToModule(current_module);
    
    // Send IPC message with the arguments to the current module
    win.webContents.once('dom-ready', () => {
        win.webContents.send('NEW', JSON.stringify(current_json));
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

ipcMain.on('LOADVIZ', (event, viz_num) => {
    if(showViz(viz_num)) {
        console.log('opening viz number:', viz_num);
    }
}); 

// Attempt to load a page
ipcMain.on('LOADMODULE', (event, module_number) =>  {
    if(goToModule(module_number)) {
        // Send IPC message with the arguments to the current module
        console.log('page load', module_number);
        win.webContents.once('dom-ready', () => {
            win.webContents.send('NEW', JSON.stringify(current_json));
        });
    } else {
        event.sender.send('LOADMODULE', 'DENIED');
    }
});

// Attempt to execute pipeline with args
ipcMain.on('EXECUTE', (event, data) => {
    execPipeline(data[0], data[1], (result) => {
        event.sender.send('EXECUTE', result);
    });
});

// Update the current pipeline args and refresh any open windows
ipcMain.on('UPDATE', (event, args) => {
    console.log("Updating args");
    updateArgs(args);
    console.log('Sending NEW')
    win.webContents.send('NEW', JSON.stringify(current_json));
});

// Menu Setup and Customization

const template = [
  {
    label: 'File',
    submenu: [
      {label: 'Save', click () {
            createSaveState(dialog.showSaveDialog());
      }},
      {label: 'Load', click () {
            loadSaveState(dialog.showOpenDialog()[0]);
      }},
    ]
  },
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
