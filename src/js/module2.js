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
const {ipcRenderer} = require('electron');

const module1 = document.getElementById("module1");
const module3 = document.getElementById("module3");

const tmOptSlider = document.getElementById('tm-opt-slider');
const tmOptBox = document.getElementById('tm-opt-box');


const gcMinSlider = document.getElementById('gc-min-slider');
const gcMinBox = document.getElementById('gc-min-box');

const gcMaxSlider = document.getElementById('gc-max-slider');
const gcMaxBox = document.getElementById('gc-max-box');

const tmSlider = document.getElementById('tm-slider');
const tmBox = document.getElementById('tm-box');
const tmCheckbox = document.getElementById('tm-checkbox');

const gcSlider = document.getElementById('gc-slider');
const gcBox = document.getElementById('gc-box');
const gcCheckbox = document.getElementById('gc-checkbox');


const hpolySlider = document.getElementById('hpoly-slider');
const hpolyBox = document.getElementById('hpoly-box');
const hpolyCheckbox = document.getElementById('hpoly-checkbox');


const dimerzSlider = document.getElementById('dimerz-slider');
const dimerzBox = document.getElementById('dimerz-box');
const dimerzCheckbox = document.getElementById('dimerz-checkbox');

const specificitySlider = document.getElementById('specificity-slider');
const specificityBox = document.getElementById('specificity-box');
const specificityCheckbox = document.getElementById('specificity-checkbox');


const degenerateSlider = document.getElementById('degenerate-slider');
const degenerateBox = document.getElementById('degenerate-box');
const degenerateCheckbox = document.getElementById('degenerate-checkbox');

const loading_logo = document.getElementById('loading_logo');

var state = {primer_scores: {}};


function updateSlider(sliderId, val){
  var slider = document.getElementById(sliderId);
  slider.value = val;
}

function updateBox(boxId, val){
  var box = document.getElementById(boxId);
  box.value = val;
}

function checkBoxUpdate(sliderId, boxId, checkBoxId){
  var checkbox = document.getElementById(checkBoxId);
  var slider = document.getElementById(sliderId);
  var box = document.getElementById(boxId);

  if (checkbox.checked == true) {
      slider.value = 1;
      box.value = 1;
    }
  else{
    slider.value = 0;
    box.value = 0;
  }
}

function sendMessage(channel, message){
  ipcRenderer.send(channel, message);
}


function init(json) {
    state = json;

    // check for previous state
    if(json['primer_scores']) {

        // tm's
        let tm = json['primer_scores']['params'];

        // tm_opt
        let val = parseInt(tm['tm_opt']);
        tmOptSlider.value = val;
        tmOptBox.value = val;

        // gc_opt
        val = parseInt(tm['gc_opt']['min'])
        gcMinSlider.value = val;
        gcMinBox.value = val;

        val = parseInt(tm['gc_opt']['max'])
        gcMaxSlider.value = val;
        gcMaxBox.value = val;

        // weights
        let weights = json['primer_scores']['params']['weights'];

        // tm
        val = weights['tm'];
        tmSlider.value = val;
        tmBox.value = val;

        // gc
        val = weights['gc'];
        gcSlider.value = val;
        gcBox.value = val;


        // homopolymer
        val = weights['homopolymer'];
        hpolySlider.value = val;
        hpolyBox.value = val;

        // dimer
        val = weights['dimer'];
        dimerzSlider.value = val;
        dimerzBox.value = val;

        // specificity
        val = weights['specificity'];
        specificitySlider.value = val;
        specificityBox.value = val;

        // degenerate
        val = weights['degenerate'];
        degenerateSlider.value = val;
        degenerateBox.value = val;
    }
    else{
      // no past state. Init JSON and inputs
      state.primer_scores = {
          params: {
              tm_opt: 55,
              gc_opt: {
                  min: 40,
                  max: 60
              },
              weights: {
                  tm: 1,
                  gc: 1,
                  homopolymer: 1,
                  dimer: 1,
                  specificity: 1,
                  degenerate: 1
              }
          }
      };

      tmOptSlider.value = 55;
      tmOptBox.value = 55;
      gcMinSlider.value = 40;
      gcMinBox.value = 40;
      gcMaxSlider.value = 60;
      gcMaxBox.value = 60;
      tmSlider.value = 1;
      tmBox.value = 1;
      gcSlider.value = 1;
      gcBox.value = 1;
      hpolySlider.value = 1;
      hpolyBox.value = 1;
      dimerzSlider.value = 1;
      dimerzBox.value = 1;
      specificitySlider.value = 1;
      specificityBox.value = 1;
      degenerateSlider.value = 1;
      degenerateBox.value = 1;

    }





}

tmOptSlider.addEventListener('change', function(){
    state['primer_scores']['params']['tm_opt'] = parseInt(tmOptSlider.value);
});

gcMinSlider.addEventListener('change', function(){
    state['primer_scores']['params']['gc_opt']['min'] = parseInt(gcMinSlider.value);
});

gcMaxSlider.addEventListener('change', function(){
    state['primer_scores']['params']['gc_opt']['max'] = parseInt(gcMaxSlider.value);
});

tmSlider.addEventListener('change', function(){
    state['primer_scores']['params']['weights']['tm'] = parseInt(tmSlider.value);
});

gcSlider.addEventListener('change', function(){
    state['primer_scores']['params']['weights']['gc'] = parseInt(gcSlider.value);
});

hpolySlider.addEventListener('change', function(){
    state['primer_scores']['params']['weights']['homopolymer'] = parseInt(hpolySlider.value);
});

dimerzSlider.addEventListener('change', function(){
    state['primer_scores']['params']['weights']['dimer'] = parseInt(dimerzSlider.value);
});

specificitySlider.addEventListener('change', function(){
    state['primer_scores']['params']['weights']['specificity'] = parseInt(specificitySlider.value);
});


degenerateSlider.addEventListener('change', function(){
    state['primer_scores']['params']['weights']['degenerate'] = parseInt(degenerateSlider.value);
});

tmCheckbox.addEventListener('change', function(){
  if (tmCheckbox.checked){
    state['primer_scores']['params']['weights']['tm'] = 1;
  }
  else{
    state['primer_scores']['params']['weights']['tm'] = 0;
  }
});

gcCheckbox.addEventListener('change', function(){
    if (gcCheckbox.checked){
      state['primer_scores']['params']['weights']['gc'] = 1;
    }
    else{
      state['primer_scores']['params']['weights']['gc'] = 0;
    }
  });

hpolyCheckbox.addEventListener('change', function(){
      if (hpolyCheckbox.checked){
        state['primer_scores']['params']['weights']['homopolymer'] = 1;
      }
      else{
        state['primer_scores']['params']['weights']['homopolymer'] = 0;
      }
    });

dimerzCheckbox.addEventListener('change', function(){
          if (dimerzCheckbox.checked){
            state['primer_scores']['params']['weights']['homopolymer'] = 1;
          }
          else{
            state['primer_scores']['params']['weights']['homopolymer'] = 0;
          }
    });

specificityCheckbox.addEventListener('change', function(){
      if (specificityCheckbox.checked){
        state['primer_scores']['params']['weights']['specificity'] = 1;
      }
      else{
        state['primer_scores']['params']['weights']['specificity'] = 0;
      }
    });

degenerateCheckbox.addEventListener('change', function(){
      if (degenerateCheckbox.checked){
        state['primer_scores']['params']['weights']['degenerate'] = 1;
      }

      else{
        state['primer_scores']['params']['weights']['degenerate'] = 0;
      }

});


tmCheckbox.addEventListener('change', function() {
    if(this.checked) {
        tmRow.style.backgroundColor = "rgb(1, 32, 53)";
        tmSlider.value = 1;
        tmBox.value = 1;
    } else {
        tmRow.style.backgroundColor = "initial";
        tmSlider.value = 0;
        tmBox.value = 0;
    }
});

gcCheckbox.addEventListener('change', function() {
    if(this.checked) {
        gcRow.style.backgroundColor = "rgb(1, 32, 53)";
        gcSlider.value = 1;
        gcBox.value = 1;
    } else {
        gcRow.style.backgroundColor = "initial";
        gcSlider.value = 0;
        gcBox.value = 0;
    }
});

hpolyCheckbox.addEventListener('change', function() {
    if(this.checked) {
        hpolyRow.style.backgroundColor = "rgb(1, 32, 53)";
        hpolySlider.value = 1;
        hpolyBox.value = 1;
    } else {
        hpolyRow.style.backgroundColor = "initial";
        hpolySlider.value = 0;
        hpolyBox.value = 0;
    }
});

dimerzCheckbox.addEventListener('change', function() {
    if(this.checked) {
        dimerizationRow.style.backgroundColor = "rgb(1, 32, 53)";
        dimerzSlider.value = 1;
        dimerzBox.value = 1;
    } else {
        dimerizationRow.style.backgroundColor = "initial";
        dimerzSlider.value = 0;
        dimerzBox.value = 0;
    }
});

specificityCheckbox.addEventListener('change', function() {
    if(this.checked) {
        specificityRow.style.backgroundColor = "rgb(1, 32, 53)";
        specificitySlider.value = 1;
        specificityBox.value = 1;
    } else {
        specificityRow.style.backgroundColor = "initial";
        specificitySlider.value = 0;
        specificityBox.value = 0;
    }
});

degenerateCheckbox.addEventListener('change', function() {
    if(this.checked) {
        degenerateRow.style.backgroundColor = "rgb(1, 32, 53)";
        degenerateSlider.value = 1;
        degenerateBox.value = 1;
    } else {
        degenerateRow.style.backgroundColor = "initial";
        degenerateSlider.value = 0;
        degenerateBox.value = 0;
    }
});

nextModule.addEventListener('click', function () {
    try {
        json_string = JSON.stringify(state);
        sendMessage('EXECUTE', ['primacy primer-score', json_string]);

        console.log("message sent");
    } catch(e) {
        console.log(e);
    }
});

//listening
ipcRenderer.on('EXECUTE', (event, arg) =>{
    if(arg != null){
        console.log("error received");
    } else {
        console.log("sending load message");
        loading_logo.style.visibility = 'visible';
        sendMessage('LOADMODULE', 3);
    }
});

ipcRenderer.on('NEW', (event, arg) =>{
    console.log("NEW received");
    loading_logo.style.visibility = 'invisible';
    console.log(arg);
    init(JSON.parse(arg));
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

// Intercept response to EXECUTE request
ipcRenderer.on('EXECUTE', (event, arg) => {
    if(arg != null) {
        console.log('Error during pipeline execution:');
        console.log(arg);
    } else {
        sendMessage('LOADVIZ', 2);
    }
});

// Intercept module load denials
ipcRenderer.on('LOADMODULE', (event, arg) => {
    console.log('Module load denied');
    submit_button.style.borderColor = "red";
    setTimeout(function(){
      submit_button.style.borderColor = "black";
    }, 150);
});
