/**
 * Desc: Listens to replys from main.js
 * Acts as a Library of helper functions for executing primacy pipeline commands
 *
 * Authors:
 *      - Austin Kelly <ak678@nau.edu>
 *      - Chance Nelson <chance-nelson@nau.edu>
 */
const os            = require('os');
// const validate      = require('input_validation.js');
const {ipcRenderer} = require('electron');


const module1            = document.getElementById("module1");
const module2            = document.getElementById("module2");
const module3            = document.getElementById("module3");
const submit_button      = document.getElementById("submitButton");
const module_1_sum       = document.getElementById('result');

var iterations           = document.getElementById("iterations");
var amplicon_slider      = document.getElementById("ampliconSlider")
var opt_amplicon_size    = document.getElementById("optimumAmpliconSize");
var max_distance         = document.getElementById("maxDistance");
var move_forward         = document.getElementById("moveForward");
var background_primers   = document.getElementById("backgroundPrimers");

var sim_melt_temp_slider = document.getElementById("simMeltTempSlider");
var sim_melt_temp        = document.getElementById("simMeltTemp");
var primer_scores_slider = document.getElementById("primerScoresSlider");
var primer_scores        = document.getElementById("primerScores");
var cross_dim_slider     = document.getElementById("crossDimerizationSlider");
var cross_dimerization   = document.getElementById("crossDimerization");
var amplicon_size_slider = document.getElementById("ampliconSizeSlider");
var amplicon_size        = document.getElementById("ampliconSize");
var amplicon_check       = document.getElementById("ampliconCheck");
var target_dist_slider   = document.getElementById("targetDistanceSlider");
var target_distance      = document.getElementById("targetDistance");
var target_dist_check    = document.getElementById("targetDistanceCheck");

var amplicon_size_row    = document.getElementById("ampliconSizeRow");
var target_distance_row  = document.getElementById("targetDistanceRow");

var last_module_results = {};
var current_module_args = {};


function sendMessage(channel, message){
    ipcRenderer.send(channel, message);
}


function init(json) {
    console.log(json);
    current_module_args = json[0];
    last_module_results = json[1];

    module_1_sum.innerHTML = last_module_results['temperature'];
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
});

ipcRenderer.on('LOADMODULE', (event, arg) =>{
    console.log("DENIED");
});

//loads tab on click
module1.addEventListener('click', function (){
    console.log("click");
    sendMessage('LOADMODULE', 0);
});

module2.addEventListener('click', function (){
    console.log("click");
    sendMessage('LOADMODULE', 1);
});

ampliconCheck.addEventListener('change', function() {
    if(this.checked) {
        amplicon_size_row.style.backgroundColor = "rgb(0, 36, 56)";
    } else {
        amplicon_size_row.style.backgroundColor = "initial";
        amplicon_size.value = undefined;
        amplicon_size_slider.value = 0;
    }
});

targetDistanceCheck.addEventListener('change', function() {
    if(this.checked) {
        target_distance_row.style.backgroundColor = "rgb(1, 32, 53)";
    } else {
        target_distance_row.style.backgroundColor = "initial";
        target_distance.value = undefined;
        target_dist_slider.value = 0;
    }
});

iterations.value = 100;
sim_melt_temp.value = 1;
primer_scores.value = 1;
cross_dimerization.value = 1;
amplicon_size.value = 1;
target_distance.value = 1;

amplicon_slider.oninput = function() {
    opt_amplicon_size.value = this.value;
};

opt_amplicon_size.oninput = function() {
    amplicon_slider.value = this.value;
};


sim_melt_temp_slider.oninput = function() {
    sim_melt_temp.value = this.value;
};

sim_melt_temp.oninput = function() {
    sim_melt_temp_slider.value = this.value;
};


primer_scores_slider.oninput = function() {
    primer_scores.value = this.value;
};

primer_scores.oninput = function() {
    primer_scores_slider.value = this.value;
};


cross_dim_slider.oninput = function() {
    cross_dimerization.value = this.value;
};

cross_dimerization.oninput = function() {
    cross_dim_slider.value = this.value;
};


amplicon_size_slider.oninput = function() {
    amplicon_size.value = this.value;
};

amplicon_size.oninput = function() {
    amplicon_size_slider.value = this.value;
};


target_dist_slider.oninput = function() {
    target_distance.value = this.value;
};

target_distance.oninput = function() {
    target_dist_slider.value = this.value;
};
