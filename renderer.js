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

console.log(submitButton, startRange, endRange);

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


//sending
function sendMessage(channel, message){
  ipcRenderer.send(channel, message);
}


//listening
ipcRenderer.on('EXECUTE', (event, arg) =>{
  if(arg != null){
    console.log("error received")
  }
  else{
    sendMessage(LOADMODULE,"No errors, load module")
  }
})


submitButton.addEventListener('click', function () {
try {
  if (startRange && endRange){
    var startString = validate.parseTemperature(startRange.value.toString());
    var endString = validate.parseTemperature(endRange.value.toString());

    json_string = {start_string: startString, end_string: endString};

    json_string = JSON.stringify(json_string)

    sendMessage('EXECUTE', ['primacy.py', json_string]);

    console.log("message sent")
  }
} catch(e) {
    while(true) {
    console.log(e)
    }
}
});
