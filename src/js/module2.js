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
const gc_min_slider  = document.getElementById('gcMinSlider');
const gc_max_slider  = document.getElementById('gcMaxSlider');
const gc_min  = document.getElementById('gcMin');
const gc_max  = document.getElementById('gcMax');
const tm_slider  = document.getElementById('tmSlider');
const gc_slider  = document.getElementById('gcSlider');
const homopolymer  = document.getElementById('hpoly');
const hpolySlider  = document.getElementById('hpolySlider');
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
const execute_button = document.getElementById('execute');


function sendMessage(channel, message){
  ipcRenderer.send(channel, message);
}

var state = {primer_scores: {}};

function init(json) {
    state = json;

    // check for previous state
    if(json['primer_scores']) {
        console.log(json['primer_scores'])
        // bootstrap current inputs
        
        // tm's
        let tm = json['primer_scores']['params'];

        // tm_opt
        let val = parseInt(tm['tm_opt']);
        tm_opt.value = val; 
        tm.value = val;

        // gc_opt
        val = parseInt(tm['gc_opt']['min'])
        gc_min.value = val;
        gc_min_slider.value = val;

        val = parseInt(tm['gc_opt']['max'])
        gc_max.value = val;
        gc_max_slider.value = val;

        // weights
        let weights = json['primer_scores']['params']['weights'];

        // tm
        val = weights['tm'];
        tm_slider.value = val;

        // gc
        val = weights['gc'];
        gc_slider.value = gc;

        // homopolymer
        val = weights['homopolymer'];
        hpolySlider.value = val;

        // dimer
        val = weights['dimer'];
        dimerz_slider.value = val;

        // specificity
        val = weights['specificity'];
        specificity.value = val;

        // degenerate
        val = weights['degenerate'];
        degenerate.value = val;

        return;
    }

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

    tm_opt.value = 55;
    gc_min.value= 40;
    gc_max.value= 60;
    gc_min_slider.value = 40;
    gc_max_slider.value = 60;
    tm.value = 1;
    gc.value = 1;
    hpoly.value = 1;
    dimerz.value = 1;
    specif.value = 1;
    specifSlider.value = 1;
    degen.value = 1;
    degenSlider.value = 1;
}

tm_opt.addEventListener('change', function(){
    state['primer_scores']['params']['tm_opt'] = parseInt(tm_opt.value);
});

gc_min_slider.addEventListener('change', function(){
    state['primer_scores']['params']['gc_min'] = parseInt(gc_min_slider.value);
});

gc_max_slider.addEventListener('change', function(){
    state['primer_scores']['params']['gc_max'] = parseInt(gc_max_slider.value);
});


tm_chkbx.addEventListener('change', function(){
  if (tm_chkbx.checked){
    state['primer_scores']['params']['tm'] = parseInt(tm.value);
  }
  else{
    state['primer_scores']['params']['tm'] = 0;
  }
});

gc_chkbx.addEventListener('change', function(){
    if (gc_chkbx.checked){
      state['primer_scores']['params']['gc'] = parseInt(gc.value);
    }
    else{
      state['primer_scores']['params']['gc'] = 0;
    }
  });

homopolymer_chkbx.addEventListener('change', function(){
      if (homopolymer_chkbx.checked){
        state['primer_scores']['params']['homopolymer'] = parseInt(homopolymer.value);
      }
      else{
        state['primer_scores']['params']['homopolymer'] = 0;
      }
    });

specificity_chkbx.addEventListener('change', function(){
      if (specificity_chkbx.checked){
        state['primer_scores']['params']['specificity'] = parseInt(specificity.value);
      }
      else{
        state['primer_scores']['params']['specificity'] = 0;
      }
    });

degenerate_chkbx.addEventListener('change', function(){
      if (degenerate_chkbx.checked){
        state['primer_scores']['params']['degenerate'] = parseInt(degenerate.value);
      }

      else{
        state['primer_scores']['params']['degenerate'] = 0;
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

tmCheckbox.addEventListener('change', function() {
    if(this.checked) {
        tmRow.style.backgroundColor = "rgb(1, 32, 53)";
        tm.value = 1;
        tm_slider.value = 1;
    } else {
        tmRow.style.backgroundColor = "initial";
        tm.value = 0;
        tm_slider.value = 0;
    }
});

gcCheckbox.addEventListener('change', function() {
    if(this.checked) {
        gcRow.style.backgroundColor = "rgb(1, 32, 53)";
        gc.value = 1;
        gc_slider.value = 1;
    } else {
        gcRow.style.backgroundColor = "initial";
        gc.value = 0;
        gc_slider.value = 0;
    }
});

homopolymer_chkbx.addEventListener('change', function() {
    if(this.checked) {
        hpolyRow.style.backgroundColor = "rgb(1, 32, 53)";
        homopolymer.value = 1;
        hpolySlider.value = 1;
    } else {
        hpolyRow.style.backgroundColor = "initial";
        homopolymer.value = 0;
        hpolySlider.value = 0;
    }
});

dimer_chkbx.addEventListener('change', function() {
    if(this.checked) {
        dimerizationRow.style.backgroundColor = "rgb(1, 32, 53)";
        dimerz.value = 1;
        dimerz_slider.value = 1;
    } else {
        dimerizationRow.style.backgroundColor = "initial";
        dimerz.value = 0;
        dimerz_slider.value = 0;
    }
});

specificity_chkbx.addEventListener('change', function() {
    if(this.checked) {
        specificityRow.style.backgroundColor = "rgb(1, 32, 53)";
        specif.value = 1;
        specifSlider.value = 1;
    } else {
        specificityRow.style.backgroundColor = "initial";
        specif.value = 0;
        specifSlider.value = 0;
    }
});

degenerate_chkbx.addEventListener('change', function() {
    if(this.checked) {
        degenerateRow.style.backgroundColor = "rgb(1, 32, 53)";
        degen.value = 1;
        degenSlider.value = 1;
    } else {
        degenerateRow.style.backgroundColor = "initial";
        degen.value = 0;
        degenSlider.value = 0;
    }
});

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
