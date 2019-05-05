/**
 * @file module3.js
 *
 * @brief Front end Javascript for controlling user input and communicating
 *        with the back end
 *
 * @author Chance Nelson <chance-nelson@nau.edu>
 */

const os            = require('os');
const fs            = require('fs');
const {ipcRenderer} = require('electron');
const papa          = require('papaparse');


const module1       = document.getElementById("module1");
const module2       = document.getElementById("module2");
const module3       = document.getElementById("module3");
const submit_button = document.getElementById("nextModule");
const module_1_sum  = document.getElementById('result');

const iterations = document.getElementById("iterations");

// Optimal amplicon min/max
const opt_amplicon_min = document.getElementById("optimumAmpliconMin");
const opt_amplicon_max = document.getElementById("optimumAmpliconMax");
const optimum_check    = document.getElementById("optimumAmpliconCheck");
const opt_amp_row      = document.getElementById("optAmpRow");

// Max distance
const max_distance        = document.getElementById("maxDistance");
const max_distance_number = document.getElementById("maxDistanceNumber");
const max_distance_row    = document.getElementById("maxDistanceRow");

// Background primers
const background_primers      = document.getElementById("backgroundPrimers");
const background_primers_list = document.getElementById('backgroundPrimersList')

// Melting temperature priority
const sim_melt_temp_slider = document.getElementById("simMeltTempSlider");
const sim_melt_temp        = document.getElementById("simMeltTemp");

// Primer score priority
const primer_scores_slider = document.getElementById("primerScoresSlider");
const primer_scores        = document.getElementById("primerScores");

// Cross-dimerization priority
const cross_dim_slider     = document.getElementById("crossDimerizationSlider");
const cross_dimerization   = document.getElementById("crossDimerization");

// Amplicon size priority
const amplicon_size_slider = document.getElementById("ampliconSizeSlider");
const amplicon_size        = document.getElementById("ampliconSize");
const amplicon_check       = document.getElementById("ampliconCheck");
const amplicon_size_row    = document.getElementById("ampliconSizeRow");

// Target distance priority
const target_dist_slider  = document.getElementById("targetDistanceSlider");
const target_distance     = document.getElementById("targetDistance");
const target_dist_check   = document.getElementById("targetDistanceCheck");
const target_distance_row = document.getElementById("targetDistanceRow");


// Current module state
var state = null;


function sendMessage(channel, message){
    ipcRenderer.send(channel, message);
}

/**
 * @brief Class structure for preserving and altering internal module 3 state
 */
class Module3 {
    /**
     * @brief Initialize the page state
     *
     * @param json JSON object indicating current pipeline state
     */
    constructor(json={}) {
        // set the defaults
        this.json = json;
        this.iter = 100;
        this.amp_size = {
            min: null,
            max: null
        };

        this.target_distance = {
            forward: null,
            reverse: null,
            any: null,
            both: null
        };

        this.background = {};

        this.weights = {
            tm: 1,
            scores: 1,
            cross_dimerization: 1,
            size: 1,
            target_dist: 1
        };

        this.background_primers = {};

        // If a previous state is available, bootstrap our internal state to
        // match
        if(json && json['set_optimization'] && json['set_optimization']['params']['iter']) {
            let set_optimization = this.json['set_optimization']['params'];
            this.iter            = set_optimization['iter'];
            this.amp_size        = set_optimization['amp_size'];
            this.target_distance = set_optimization['target_distance'];
            this.background      = set_optimization['background'];
            this.weights         = set_optimization['weights'];
        }

        if(json['set_optimization'] && json['set_optimization']['params']['include']) {
            this.include = json['set_optimization']['params']['include'];
            console.log("input");
            console.log(this.include);
            console.log(json);
        }

        // set all inputs to reflect the current module state
        iterations.value         = this.iter;
        sim_melt_temp.value      = this.weights.tm;
        primer_scores.value      = this.weights.scores;
        cross_dimerization.value = this.weights.cross_dimerization;
        amplicon_size.value      = this.weights.size;
        target_distance.value    = this.weights.target_dist;
    }

    /**
     * @brief generate a json args string based on the current args and
     *        previous pipeline state.
     */
    toJSON() {
        let out = {};
        out['set_optimization'] = {}
        out['set_optimization']['params'] = {};

        let params = out['set_optimization']['params'];
        params['iter'] = this.iter;
        params['amp_size'] = this.amp_size;
        params['target_distance'] = this.target_distance;
        params['background'] = this.background;
        params['weights'] = this.weights;
        params['include'] = this.include;

        console.log(out)
        return out;
    }

    /**
     * @brief add a series of background primers, parsed from a CSV
     *
     * @param file_path path to the file to parse out
     */
    addBackgroundPrimers(file_path) {
        papa.parse(file_path, {
            complete: function(results) {
                let keys = results.data[0];
                for(let i = 1; i < results.data.length; i++) {
                    if(results.data[i].length != keys.length) {
                        continue;
                    }

                    let values = {
                        id: null,
                        seq: null
                    };

                    for(let j = 0; j < results.data[i].length; j++) {
                        console.log(results.data[i][j]);
                        values[keys[j]] = results.data[i][j];
                    }

                    console.log(values);

                    let good = true;
                    for(let key in values) {
                        if(!values[key]) {
                            good = false;
                            break;
                        }
                    }

                    if(!good) {
                        continue;
                    }

                    // add the background primer to the member
                    state.background[values.id] = {seq: values.seq};
                }

                // fire the event listener for the background sequence list
                background_primers_list.dispatchEvent(new Event('change'));
            }
        });
    }
}



/**
 * @brief recieve a new CSV of packground primers to add into the list
 */
background_primers.addEventListener('change', function() {
    let file_path = background_primers.files[0];
    state.addBackgroundPrimers(file_path);

    background_primers.files = null;
});

/**
 * @brief refresh the primers list table
 */
background_primers_list.addEventListener('change', function() {
    // Clear out the table
    while (this.firstChild) {
        this.removeChild(this.firstChild);
    }

    // Add a new row for each background primer
    for(seq in state.background) {
        console.log(seq);
        let row = this.insertRow();

        let cell = row.insertCell(0);
        cell.innerHTML = seq;

        cell = row.insertCell(1);
        cell.innerHTML = state.background[seq]['seq'];

        cell = row.insertCell(2);
        let remove_btn = document.createElement('BUTTON');
        remove_btn.innerHTML = 'Remove';

        /**
         * @brief remove this sequence from the internal sequence list and refresh the list
         */
        remove_btn.addEventListener('click', function() {
            delete state.background[seq];
            background_primers_list.dispatchEvent(new Event('change'));
        });

        cell.appendChild(remove_btn);
    }
});


/**
 * @brief enable or disable optimum amplicon input
 */
optimumAmpliconCheck.addEventListener('change', function() {
    if(this.checked) {
        opt_amp_row.style.backgroundColor = "rgb(0, 36, 56)";
    } else {
        opt_amp_row.style.backgroundColor = "initial";
        opt_amplicon_min.value = 0;
        opt_amplicon_max.value = 0;
        state.amp_size = {
            min: null,
            max: null
        };
    }
});

/**
 * @brief set the minimum amplicon value input
 */
opt_amplicon_min.addEventListener('change', function() {
    if(optimumAmpliconCheck.checked) {
        let max = parseInt(opt_amplicon_max.value);
        let min = parseInt(this.value);

        if(max < min) {
            this.value = max;
            opt_amplicon_max.value = min;

            opt_amplicon_max.dispatchEvent(new Event('change'));
        }

        state.amp_size.min = parseInt(this.value);
    } else {
        this.value = 0;
    }
});

/**
 * @brief set the maximum amplicon value input
 */
opt_amplicon_max.addEventListener('change', function() {
    if(optimumAmpliconCheck.checked) {
        let min = parseInt(opt_amplicon_min.value);
        let max = parseInt(this.value);

        if(max < min) {
            this.value = min;
            opt_amplicon_min.value = max;

            opt_amplicon_min.dispatchEvent(new Event('change'));
        }

        state.amp_size.max = parseInt(this.value);
    } else {
        this.value = 0;
    }
});


/**
 * @brief set the max distance type input
 */
max_distance.addEventListener('change', function() {
    let new_json = {
        forward: null,
        reverse: null,
        any: null,
        both: null
    };

    switch(this.value) {
        case 'None':
            break;
        case 'Distance from forward primer':
            new_json.forward = parseInt(max_distance_number.value);
            break;
        case 'Distance from reverse primer':
            new_json.reverse = parseInt(max_distance_number.value);
            break;
        case 'Distance from at least one primer':
            new_json.any = parseInt(max_distance_number.value);
            break;
        case 'Distance from both primers':
            new_json.both = parseInt(max_distance_number.value);
    }

    state.target_distance = new_json;
});

/**
 * @brief set the number for max distance
 */
max_distance_number.addEventListener('change', function() {
    console.log(this.value);
    if(parseInt(this.value) < 0) {
        this.value = 0;
    }

    max_distance.dispatchEvent(new Event('change'));
});


/**
 * @brief enable or disable the amplicon input
 */
ampliconCheck.addEventListener('change', function() {
    if(this.checked) {
        amplicon_size_row.style.backgroundColor = "rgb(0, 36, 56)";
    } else {
        amplicon_size_row.style.backgroundColor = "initial";
        amplicon_size.value = 0;
        amplicon_size_slider.value = 0;
    }

    // fire the change event to finilize changes in the state
    amplicon_size_slider.dispatchEvent(new Event('change'));
});


/**
 * @brief enable or disable the target distance input
 */
targetDistanceCheck.addEventListener('change', function() {
    if(this.checked) {
        target_distance_row.style.backgroundColor = "rgb(1, 32, 53)";
    } else {
        target_distance_row.style.backgroundColor = "initial";
        target_distance.value = 0;
        target_dist_slider.value = 0;
    }

    // fire the change event to finilize changes in the state
    target_dist_slider.dispatchEvent(new Event('change'));
});


/**
 * @brief set the melting temperature input slider value
 */
sim_melt_temp_slider.addEventListener('change', function() {
    sim_melt_temp.value = this.value;

    // fire the change event on the temperature element
    sim_melt_temp.dispatchEvent(new Event('change'));
});

/**
 * @brief set the melting temperature text value
 */
sim_melt_temp.addEventListener('change', function() {
    sim_melt_temp_slider.value = this.value;
    state.weights.tm = parseInt(this.value);
});


/**
 * @brief set the primer score slider value
 */
primer_scores_slider.addEventListener('change', function() {
    primer_scores.value = this.value;

    // fire the change event on the primer scores element
    primer_scores.dispatchEvent(new Event('change'));
});

/**
 * @brief set the primer scores text value
 */
primer_scores.addEventListener('change', function() {
    primer_scores_slider.value = this.value;
    state.weights.scores = parseInt(this.value);
});


/**
 * @brief set the cross-dimerization slider value
 */
cross_dim_slider.addEventListener('change', function() {
    cross_dimerization.value = this.value;

    // fire the change event on the cross-dimerization element
    cross_dimerization.dispatchEvent(new Event('change'));
});

/**
 * @brief set the corss-dimerization text value
 */
cross_dimerization.addEventListener('change', function() {
    cross_dim_slider.value = this.value;
    state.weights.cross_dimerization = parseInt(this.value);
});


/**
 * @brief set the amplicon size slider value
 */
amplicon_size_slider.addEventListener('change', function() {
    amplicon_size.value = this.value;

    // fire the change event on the amplicon size event
    amplicon_size.dispatchEvent(new Event('change'));
});

/**
 * @brief set the amplicon size text value
 */
amplicon_size.addEventListener('change', function() {
    amplicon_size_slider.value = this.value;
    state.weights.size = parseInt(this.value);
});


/**
 * @brief set the target distance slider value
 */
target_dist_slider.addEventListener('change', function() {
    if(targetDistanceCheck.checked) {
        target_distance.value = this.value;

        // fire the change event on the target distance event
        target_distance.dispatchEvent(new Event('change'));
    }
});

/**
 * @brief set the target distance text value
 */
target_distance.addEventListener('change', function() {
    if(targetDistanceCheck.checked) {
        target_dist_slider.value = this.value;
        state.weights.target_dist = parseInt(this.value);
    }
});


/**
 * @brief set the iterations text value
 */
iterations.addEventListener('change', function() {
    let val = parseInt(this.value);
    if(val < 0) {
        this.value = 1;
        val = 1;
    } else if(val > 100) {
        this.value = 100;
        val = 100;
    }

    state.iter = val;
});


//listening
ipcRenderer.on('EXECUTE', (event, arg) =>{
    if(arg != null){
        console.log("error received");
    } else {
        console.log("sending load message");
        sendMessage('LOADVIZ', 3);
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

submit_button.addEventListener('click', function() {
    console.log(state.toJSON());
    sendMessage('EXECUTE', ['primacy set-optimization', JSON.stringify(state.toJSON())])
});


if(!state) {
    state = new Module3();
}
