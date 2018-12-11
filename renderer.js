/**
 * Desc: Listens to replys from main.js
 * Acts as a Library of helper functions for executing primacy pipeline commands
 *
 * Authors:
 *      - Austin Kelly <ak678@nau.edu>
 */

const submitButton = document.getElementById("submitButton");
var startRange = document.getElementById("startRange");
var endRange = document.getElementById("endRange");

//spawns shell
const shell = require('electron').shell;
//gets users home directory
const os = require('os');

var validate = require('./lib/input_validation.js');

const {ipcRenderer} = require('electron');

//sends "hello" to asynchronous-message channel
ipcRenderer.send('asynchronous-message', 'hello');

//Does event on reply
ipcRenderer.on('asynchronous-reply', (event, arg) =>{
  console.log(arg);
})


//Send Section

function sendMessage(channel, message){
  ipcRenderer.send(channel, message);
}

function pipelineExecute(cmd, arg){
  /**
   * Desc: takes in a file path and executes helper function with it
   *
   * Args:
   *      function to be called (json str)
   *
   *
   * Returns:
   *      -
   */
   sendMessage(EXECUTE,'DONE');
}


//Events on Reply Section



function LOADMODULE(int module){

}

// NEW, ARGS
// //create new page
// listen for DENIED
//
// POPULATE PAGE


submitButton.addEventListener('click', function () {
try {
  if (validate.parseTemperature(startRange.value.toString())||
      validate.parseTemperature(endRange.value.toString())){
    console.log("test");
  } else {
    let python = spawn('python primacy.py', {'range-lower': startRange, 'range-upper': endRange}.toString());

    python.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
  }
} catch(e) {console.log(e)}
});
