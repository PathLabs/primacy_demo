/**
 * Desc: Listens to replys from main.js
 * Acts as a Library of helper functions for executing primacy pipeline commands
 *
 * Authors:
 *      - Austin Kelly <ak678@nau.edu>
 *      - Chance Nelson <chance-nelson@nau.edu>
 */
const os            = require('os');
const validate      = require('./lib/input_validation.js');
const {ipcRenderer} = require('electron');


const module0       = document.getElementById("module0");
const module1       = document.getElementById("module1");
const module2       = document.getElementById("module2")
const submit_button = document.getElementById("submitButton");
const module_0_sum  = document.getElementById('result');
const slider        = document.getElementById('slider');
const slider_value  = document.getElementById('sliderValue');


var last_module_results = {};
var current_module_args = {};


function sendMessage(channel, message){
  ipcRenderer.send(channel, message);
}


function init(json) {
    console.log(json);
    current_module_args = json[0];
    last_module_results = json[1];

    if(current_module_args) {
        slider.value = current_module_args['temperature'];
    } else {
        current_module_args = {'temperature': parseInt(slider.value)};
    }

    module_0_sum.innerHTML = last_module_results['range-diff'];
    slider_value.innerHTML = slider.value;
}


//listening
ipcRenderer.on('EXECUTE', (event, arg) =>{
  if(arg != null){
    console.log("error received")
  }
  else{
    console.log("sending load message")
    sendMessage('LOADMODULE', 2)
  }
})

ipcRenderer.on('NEW', (event, arg) =>{
    console.log("NEW received")
    init(arg)
})

ipcRenderer.on('LOADMODULE', (event, arg) =>{
  console.log("DENIED");
})

//loads tab on click
module0.addEventListener('click', function (){
  console.log("click");
  sendMessage('LOADMODULE', 0);
});

module1.addEventListener('click', function (){
  console.log("click");
  sendMessage('LOADMODULE', 1);
});

slider.addEventListener('input', function() {
    slider_value.innerHTML = slider.value;
    current_module_args['temperature'] = parseInt(slider.value);
});

submitButton.addEventListener('click', function () {
try {

    json_string = JSON.stringify(current_module_args);
    sendMessage('EXECUTE', ['primacy2.py', json_string]);

    console.log("message sent")
} catch(e) {
    console.log(e)
}
});
