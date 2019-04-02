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
// const validate      = require('./input_validation.js');
const {ipcRenderer} = require('electron');


const module1 = document.getElementById("module1");
const module3 = document.getElementById("module3");

const tm_opt = document.getElementById('tm_opt');
const tm = document.getElementById('tm')
const gc = document.getElementById('gc')

const gc_min_val  = document.getElementById('gcMinSlider');
const gc_max_val  = document.getElementById('gcMaxSlider');

const tm_slider  = document.getElementById('tmSlider');
const gc_slider  = document.getElementById('gcSlider');
const homopolymer  = document.getElementById('hpoly');
const dimerz_slider = document.getElementById('dimerzSlider');
const specificity  = document.getElementById('specifSlider');
const degenerate  = document.getElementById('degenSlider');


const tm_chkbx  = document.getElementById('tmCheckbox');
const gc_chkbx  = document.getElementById('gcCheckbox');
const homopolymer_chkbx  = document.getElementById('hpolyCheckbox');
const dimer_chkbx  = document.getElementById('dimerzCheckbox');
const specificity_chkbx  = document.getElementById('specifCheckbox');
const degenerate_chkbx  = document.getElementById('degenCheckbox');

const submit_button = document.getElementById("nextModule");


var last_module_results = {};
var current_module_args = {};

function sendMessage(channel, message){
  ipcRenderer.send(channel, message);
}



function init(json) {
    current_module_args = json[0];
    last_module_results = json[1]

    if(current_module_args) {
        tm_opt.value = current_module_args['tm_opt'];
        gc_min_val.value = current_module_args['gc_min'];
        gc_max_val.value = current_module_args['gc_max'];
        tm.value = current_module_args['tm'];
        gc.value = current_module_args['gc'];
        homopolymer.value = current_module_args['homopolymer'];
        specificity.value = current_module_args['specificity'];
        degenerate.value = current_module_args['specificity'];
    }

    tm.value = 1;
    gc.value = 1;
    hpoly.value = 1;
    dimerz.value = 1;
    specif.value = 1;
    specifSlider.value = 1;
    degen.value = 1;
    degenSlider.value = 1;
}

//listening
ipcRenderer.on('EXECUTE', (event, arg) =>{
    if(arg != null){
        console.log("error received");
    } else {
        console.log("sending load message");
        sendMessage('LOADMODULE', 3);
    }
});

ipcRenderer.on('NEW', (event, arg) =>{
    console.log("NEW received");
    init(arg);
});

ipcRenderer.on('LOADMODULE', (event, arg) =>{
    console.log("DENIED");
});

//loads tab on click
module1.addEventListener('click', function (){
    console.log("click");
    sendMessage('LOADMODULE', 1);
});

module3.addEventListener('click', function (){
    console.log("click");
    sendMessage('LOADMODULE', 3);
});


tm_opt.addEventListener('change', function(){
  current_module_args['tm_opt'] = parseInt(tm_opt.value);
});

gc_min_val.addEventListener('change', function(){
  current_module_args['gc_min'] = parseInt(gc_min_val.value);
});

gc_max_val.addEventListener('change', function(){
  current_module_args['gc_max'] = parseInt(gc_max_val.value);
});


tm_chkbx.addEventListener('change', function(){
  if (tm_chkbx.checked){
    current_module_args['tm'] = parseInt(tm.value);
  }
  else{
    current_module_args['tm'] = 0;
  }
});

gc_chkbx.addEventListener('change', function(){
    if (gc_chkbx.checked){
      current_module_args['gc'] = parseInt(gc.value);
    }
    else{
      current_module_args['gc'] = 0;
    }
  });

homopolymer_chkbx.addEventListener('change', function(){
      if (homopolymer_chkbx.checked){
        current_module_args['homopolymer'] = parseInt(homopolymer.value);
      }
      else{
        current_module_args['homopolymer'] = 0;
      }
    });

specificity_chkbx.addEventListener('change', function(){
      if (specificity_chkbx.checked){
        current_module_args['specificity'] = parseInt(specificity.value);
      }
      else{
        current_module_args['specificity'] = 0;
      }
    });

degenerate_chkbx.addEventListener('change', function(){
      if (degenerate_chkbx.checked){
        current_module_args['degenerate'] = parseInt(degenerate.value);
      }

      else{
        current_module_args['degenerate'] = 0;
      }

});



nextModule.addEventListener('click', function () {
    try {
        json_string = JSON.stringify(current_module_args);
        sendMessage('EXECUTE', ['primacy2.py', json_string]);

        console.log("message sent");
    } catch(e) {
        console.log(e);
    }
});

tmCheckbox.addEventListener('change', function() {
    if(this.checked) {
        tmRow.style.backgroundColor = "rgb(1, 32, 53)";
    } else {
        tmRow.style.backgroundColor = "initial";
        tm.value = 0;
        tm_slider.value = 0;
    }
});

gcCheckbox.addEventListener('change', function() {
    if(this.checked) {
        gcRow.style.backgroundColor = "rgb(1, 32, 53)";
    } else {
        gcRow.style.backgroundColor = "initial";
        gc.value = 0;
        gc_slider.value = 0;
    }
});

homopolymer_chkbx.addEventListener('change', function() {
    if(this.checked) {
        hpolyRow.style.backgroundColor = "rgb(1, 32, 53)";
    } else {
        hpolyRow.style.backgroundColor = "initial";
        homopolymer.value = 0;
        hpolySlider.value = 0;
    }
});

dimer_chkbx.addEventListener('change', function() {
    if(this.checked) {
        dimerizationRow.style.backgroundColor = "rgb(1, 32, 53)";
    } else {
        dimerizationRow.style.backgroundColor = "initial";
        dimerz.value = 0;
        dimerz_slider.value = 0;
    }
});

specificity_chkbx.addEventListener('change', function() {
    if(this.checked) {
        specificityRow.style.backgroundColor = "rgb(1, 32, 53)";
    } else {
        specificityRow.style.backgroundColor = "initial";
        specif.value = 0;
        specifSlider.value = 0;
    }
});

degenerate_chkbx.addEventListener('change', function() {
    if(this.checked) {
        degenerateRow.style.backgroundColor = "rgb(1, 32, 53)";
    } else {
        degenerateRow.style.backgroundColor = "initial";
        degen.value = 0;
        degenSlider.value = 0;
    }
});
