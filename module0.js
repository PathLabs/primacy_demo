/**
 * Desc: Listens to replys from main.js
 * Acts as a Library of helper functions for executing primacy pipeline commands
 *
 * Authors:
 *      - Austin Kelly <ak678@nau.edu>
 */

const module0 = document.getElementById("module0");
const module1 = document.getElementById("module1");
const submitButton = document.getElementById("submitButton");
var lowerRange = document.getElementById("startRange");
var endRange = document.getElementById("endRange");



console.log(submitButton, startRange, endRange);

//gets users home directory
const os = require('os');

var validate = require('./lib/input_validation.js');

const {ipcRenderer} = require('electron');

//sending
function sendMessage(channel, message){
  ipcRenderer.send(channel, message);
}

function populate(json_string){
  console.log(json_string);
  console.log(json_string['range-lower'])
  result_json = json_string;
  startRange.value = result_json['range-lower'];
  endRange.value = result_json['range-upper'];
}

//listening
ipcRenderer.on('EXECUTE', (event, arg) =>{
  if(arg != null){
    console.log("error received")
  }
  else{
    console.log("sending load message")
    sendMessage('LOADMODULE', 1)
  }
})

ipcRenderer.on('NEW', (event, arg) =>{
  console.log("NEW received")
  populate(arg[0])
})

ipcRenderer.on('LOADMODULE', (event, arg) =>{
  console.log("DENIED");
})


//loads tab on click
module1.addEventListener('click', function (){
  console.log("click");
  sendMessage('LOADMODULE', 1);
});


submitButton.addEventListener('click', function () {
try {
  if (startRange && endRange){
    var startString = validate.parseTemperature(startRange.value.toString());
    var endString = validate.parseTemperature(endRange.value.toString());

    json_string = {'range-lower': startString, 'range-upper': endString};

    json_string = JSON.stringify(json_string)

    sendMessage('EXECUTE', ['primacy.py', json_string]);

    console.log("message sent")
  }
} catch(e) {
    console.log(e)
}
});
