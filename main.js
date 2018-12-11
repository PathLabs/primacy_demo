/**
 * Desc: Main file for controlling window rendering and backend pipeline communication.
 *
 * Authors:
 *      - Chance Nelson <chance-nelson@nau.edu>
 */


const { app, BrowserWindow } = require('electron');
const {ipc}                  = require('electron');
const { exec }               = require('child_process');

var fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected
let win;

var pipeline_args    = [{}];
var pipeline_results = [];
var current_module   = 0;


function initial() {
    /**
     * Desc: Create the initial window, and set the close handler
     */
    // Create the browser window.
    win = new BrowserWindow({width: 1024, height:768, backgroundColor: '#000'});

    // and load the index.html of the app.
    win.loadURL('file:///'+ __dirname + '/module0.html');
    console.log('loading module0.html');

    // Open the DevTools.
    //win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
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

    if(pipeline_args.length < module_number) {
        return false;
    }
    
    // Load the html
    win.loadURL('file:///' + __dirname + '/module' + Integer.toString(module_number));

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
   
    pipeline_args[current_module] = args_json;

    fs.writeFile(__dirname + 'args.json', args_json.toString());

    result = pipeline.pipeline(cmd, __dirname + 'args.json');

    child_process.exec(__dirname + '/lib/pipeline/' + cmd + 'args.json', (error, stdout, stderr) => {
        if(!stdout || stdout == '') {
            callback(stdout);

        } else {
            // Read back in file
            fs.readFile(__dirname + 'args.json', 'utf-8', (err, data) => {
                if(err) {
                    console.log('Error reading json args file:', err);
                    callback('Error reading json args file');
                }

                pipeline_results[current_module] = JSON.parse(result);
                callback(null);
            });
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
  if (win === null) {;
    initial();
  }
});



/* IPC EVENTS */

// Attempt to load a page
ipc.on('LOADPAGE', (event, module_number) =>  {
    if(loadPage(data)) {
        // Send IPC message with the arguments to the current module
        win.webContents.send('NEW', JSON.toString(pipeline_args[module_number]));
    }
});

// Attempt to execute pipeline with args
ipc.on('EXECUTE', (event, data) => {
    result = execPipeline(data[0], data[1], (result) => {
        pipeline_results[pipeline_current] = result;
        event.sender.send('EXECUTE', result);
    });
})
