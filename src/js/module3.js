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
var amplicon_slider      = document.getElementById("ampliconSlider");
var opt_amplicon_size    = document.getElementById("optimumAmpliconSize");
var optimum_check        = document.getElementById("optimumAmpliconCheck");
var max_distance         = document.getElementById("maxDistance");
var max_distance_check   = document.getElementById("maxDistanceCheck");
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

var opt_amp_row          = document.getElementById("optAmpRow");
var max_distance_row     = document.getElementById("maxDistanceRow");
var amplicon_size_row    = document.getElementById("ampliconSizeRow");
var target_distance_row  = document.getElementById("targetDistanceRow");


// Current module state
var state = null;


function sendMessage(channel, message){
    ipcRenderer.send(channel, message);
}


class Module3 {
    /**
     * @brief Initialize the page state
     *
     * @param json JSON object indicating current pipeline state
     */
    constructor(json=null) {
        // set the defaults
        this.json = json;
        this.iter = 100;
        this.amp_size = {
            min: null,
            max: null;
        };
        this.target_sequence = {
            forward: null,
            reverse: null,
            any: null,
            both: null
        };
        this.background = {
            //primer_id: {seq: ''}
        };
        this.weights = {
            tm: 1,
            scores: 1,
            cross_dimerization: 1,
            size: 1,
            target_dist: 1
        }
        this.include = {
            //seq_id: {
            //    forward: {
            //        primer_ids: [
            //            type: array
            //            description: array of primer ids that should be included
            //        ]},
            //    reverse: {
            //        ...
            //    }
            //},
        }

        // If a previous state is available, bootstrap our internal state to 
        // match
        if(json && json['set_optimization']) {
            let set_optimization = json['set_optimization'];
            this.iter            = set_optimization['iter'];
            this.amp_size        = set_optimization['amp_size'];
            this.target_sequence = set_optimization['target_sequence'];
            this.background      = set_optimization['background'];
            this.weights         = set_optimization['weights'];
            this.include         = set_optimization['include'];
        }

        // set all inputs to reflect the current module state
        iterations.value = this.iter;
        sim_melt_temp.value = this.weights.tm;
        primer_scores.value = this.weights.scores;
        cross_dimerization.value = this.weights.cross_dimerization;
        amplicon_size.value = this.weights.amplicon_size;
        target_distance.value = this.weights.target_dist;
    }
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
    state = new Module3(JSON.parse(arg));
});

ipcRenderer.on('LOADMODULE', (event, arg) =>{
    console.log("DENIED");
});

//loads tab on click
module1.addEventListener('click', function (){
    console.log("click");
    sendMessage('LOADMODULE', 1);
});

module2.addEventListener('click', function (){
    console.log("click");
    sendMessage('LOADMODULE', 2);
});

optimumAmpliconCheck.addEventListener('change', function() {
    if(this.checked) {
        opt_amp_row.style.backgroundColor = "rgb(0, 36, 56)";
    } else {
        opt_amp_row.style.backgroundColor = "initial";
        opt_amplicon_size.value = 0;
        amplicon_slider.value = 0;
    }
});

maxDistanceCheck.addEventListener('change', function() {
    if(this.checked) {
        max_distance_row.style.backgroundColor = "rgb(1, 32, 53)";
    } else {
        max_distance_row.style.backgroundColor = "initial";
        max_distance.value = "None";
    }
});

ampliconCheck.addEventListener('change', function() {
    if(this.checked) {
        amplicon_size_row.style.backgroundColor = "rgb(0, 36, 56)";
    } else {
        amplicon_size_row.style.backgroundColor = "initial";
        amplicon_size.value = 0;
        amplicon_size_slider.value = 0;
    }
});

targetDistanceCheck.addEventListener('change', function() {
    if(this.checked) {
        target_distance_row.style.backgroundColor = "rgb(1, 32, 53)";
    } else {
        target_distance_row.style.backgroundColor = "initial";
        target_distance.value = 0;
        target_dist_slider.value = 0;
    }
});

amplicon_slider.addEventListener('change', function() {
    opt_amplicon_size.value = this.value;
};

opt_amplicon_size.addEventListener('change', function() {
    amplicon_slider.value = this.value;
    // TODO: set amplicon size
};


sim_melt_temp_slider.addEventListener('change', function() {
    sim_melt_temp.value = this.value;
};

sim_melt_temp.addEventListener('change', function() {
    sim_melt_temp_slider.value = this.value;
    state.weights.tm = parseInt(this.value);
};


primer_scores_slider.addEventListener('change', function() {
    primer_scores.value = this.value;
});

primer_scores.addEventListener('change', function() {
    primer_scores_slider.value = this.value;
    state.weights.scores = parseInt(this.value);
});


cross_dim_slider.addEventListener('change', function() {
    cross_dimerization.value = this.value;
});

cross_dimerization.addEventListener('change', function() {
    cross_dim_slider.value = this.value;
    state.weights.cross_dimerization = parseInt(this.value);
});


amplicon_size_slider.addEventListener('change', function() {
    amplicon_size.value = this.value;
});

amplicon_size.addEventListener('change', function() {
    amplicon_size_slider.value = this.value;
    state.weights.amplicon_size = parseInt(this.value);
});


target_dist_slider.addEventListener('change', function() {
    target_distance.value = this.value;
});

target_distance.addEventListener('change', function() {
    target_dist_slider.value = this.value;
    state.weights.target_dist = parseInt(this.value);
});
