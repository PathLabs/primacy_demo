/**
 * Desc: Listens to replys from main.js
 * Acts as a Library of helper functions for executing primacy pipeline commands
 *
 * Authors:
 *      - Austin Kelly <ak678@nau.edu>
 *      - Chance Nelson <chance-nelson@nau.edu>
 *      - Alex Lacy <al2428@nau.edu>
 */
const os            = require('os');
const validate      = require('input_validation.js');
const {ipcRenderer} = require('electron');


const module1 = document.getElementById("module1");
const module3 = document.getElementById("module3");

const tm_opt = document.getElementById('tm_opt');
const gc_min_val  = document.getElementById('gcMin');
const gc_max_val  = document.getElementById('gcMax');

const tm  = document.getElementById('tmSlider');
const gc  = document.getElementById('gcfSlider');
const homopolymer  = document.getElementById('hpolySlider');
const dimer  = document.getElementById('dimerzSlider');
const specificity  = document.getElementById('specifSlider');
const degenerate  = document.getElementById('degenSlider');


const tm_chkbx  = document.getElementById('tmCheckbox');
const gc_chkbx  = document.getElementById('gcCheckbox');
const homopolymer_chkbx  = document.getElementById('hpolyCheckbox');
const dimer_chkbx  = document.getElementById('dimerzCheckbox');
const specificity_chkbx  = document.getElementById('specifCheckbox');
const degenerate_chkbx  = document.getElementById('degenCheckbox');



const submit_button = document.getElementById("submitButton");


var current_module_args = {};


function sendMessage(channel, message){
  ipcRenderer.send(channel, message);
}



function init(json) {
    console.log(json);
    current_module_args = json[0];

    if(current_module_args) {
        gc_min_slider.value = current_module_args['gc_min_val'];
        gc_max_slider.value = current_module_args['gc_max_val'];
    } else {
        current_module_args = {'gc_min_val': parseInt(gc_min_slider.value),
              'gc_max_val': parseInt(gc_max_slider.value)};
    }
    gc_min_val.innerHTML = gc_min_slider.value;
    gc_max_val.innerHTML = gc_max_slider.value;
}


//listening
ipcRenderer.on('EXECUTE', (event, arg) =>{
    if(arg != null){
        console.log("error received");
    } else {
        console.log("sending load message");
        sendMessage('LOADMODULE', 2);
    }
});

ipcRenderer.on('NEW', (event, arg) =>{
    console.log("NEW received");
    init(arg);
})

ipcRenderer.on('LOADMODULE', (event, arg) =>{
    console.log("DENIED");
})


//loads tab on click
module1.addEventListener('click', function (){
    console.log("click");
    sendMessage('LOADMODULE', 0);
});

module3.addEventListener('click', function (){
    console.log("click");
    sendMessage('LOADMODULE', 2);
});

gc_min_slider.addEventListener('input', function() {
    gc_min_val.innerHTML = gc_min_slider.value;
    current_module_args['gc_min_val'] = parseInt(gc_min_slider.value);
});

gc_max_slider.addEventListener('input', function() {
    gc_max_val.innerHTML = gc_max_slider.value;
    current_module_args['gc_max_val'] = parseInt(gc_max_slider.value);
});

tmSlider.addEventListener('input', function() {
    tm.innerHTML = tmSlider.value;
    current_module_args['tm'] = parseInt(tmSlider.value);
});

gcfSlider.addEventListener('input', function() {
    gcf.innerHTML = gcfSlider.value;
    current_module_args['gc'] = parseInt(gcfSlider.value);
});


hpolySlider.addEventListener('input', function() {
    hpoly.innerHTML = hpolySlider.value;
    current_module_args['homopolymer'] = parseInt(hpolySlider.value);
});

dimerzSlider.addEventListener('input', function() {
    dimerz.innerHTML = dimerzSlider.value;
    current_module_args['dimer'] = parseInt(dimerzSlider.value);
});

specifSlider.addEventListener('input', function() {
    specif.innerHTML = specifSlider.value;
    current_module_args['specifity'] = parseInt(specifSlider.value);
});

degenSlider.addEventListener('input', function() {
    degen.innerHTML = degenSlider.value;
    current_module_args['degenerate'] = parseInt(dimerzSlider.value);
});



submitButton.addEventListener('click', function () {
    try {
        json_string = JSON.stringify(current_module_args);
        sendMessage('EXECUTE', ['primacy2.py', json_string]);

        console.log("message sent");
    } catch(e) {
        console.log(e);
    }
});
