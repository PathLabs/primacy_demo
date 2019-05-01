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

// Current pipeline state
var state = {};


function sendMessage(channel, message){
    ipcRenderer.send(channel, message);
}


/**
 * @brief Initialize the page state
 *
 * @param json JSON object indicating current pipeline state
 */
function init(json) {
    state = json;

    // check if this has already been submitted
    if(state['set_optimization']) {
        // TODO: bootstrap page
        return;
    }

    // TODO: Bootstrap page with defaults
    state['primer_optimization'] = {
        params: {
            iter: 100,
            amp_size: {
                min: null,
                max: null
            },
            target_distance: {
                forward: null,
                reverse: null
                any: null,
                both: null
            },
            background: {
                //primer_id: {
                //    seq: {
                //}
            },
            weights: {
                tm: 1,
                scores: 1,
                cross_dimerization: 1,
                size: 1,
                target_dist: 1
            },
            include: {
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
        }
    };

    iterations.value = 100;
    sim_melt_temp.value = 1;
    primer_scores.value = 1;
    cross_dimerization.value = 1;
    amplicon_size.value = 1;
    target_distance.value = 1;
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
