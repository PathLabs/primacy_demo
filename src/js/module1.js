/**
 * @file module1.js
 *
 *  JS for Primacy GUI Module 1: Primer Collection
 *
 * @author Chance Nelson <chance-nelson@nau.edu>
 */


//gets users home directory
const os = require('os');
const fs = require('fs');
const papa = require('papaparse');
const validate = require('../js/input_validation.js');

const {ipcRenderer} = require('electron');


var state;


const module_2 = document.getElementById('module2');
const pcr_salts_inputs = document.querySelectorAll('#pcr > tbody > tr > td > input');
const background_seq_fp = document.querySelector('#background_seq_fp');
const manual_submit = document.getElementById('manual_submit');
const bulk_upload = document.getElementById('fasta_file_upload');
const metadata_upload = document.getElementById('metadata_upload');
const module_3 = document.getElementById('module3');
const module_4 = document.getElementById('module4');
const submit = document.getElementById('nextModule');
const execute = document.getElementById('execute');
const default_target_start = document.getElementById('default_target_start');
const default_target_end = document.getElementById('default_target_end');
const default_min_length = document.getElementById('default_min_length');
const default_max_length = document.getElementById('default_max_length');
const search_box = document.getElementById('search_box');
const change_all = document.getElementById('change_all');


var manual_sequence = document.getElementById('manual_sequence');


/**
 *  object for the state of module 1
 */
class Module1 {
    /**
     *  Constructor for module 1 state. Can accept a JSON object of a
     *        previous state to bootstrap from.
     *
     * @param previous_state JSON object that contains the arguments for
     *        a run of Primacy module 1.
     */
    constructor(state=null) {

        manual_sequence.value = "";

        this.target_regions = {};

        this.background_sequences = [];

        this.pcr_salts = {
            'Na': 50,
            'K': 0,
            'Tris': 0,
            'Mg': 0,
            'dNTPs': 0
        };


        // Attempt to load previous config from state
        if(state && state['primer_collection']) {
            this.pcr_salts            = state['primer_collection']['params']['pcr_salts'];
            this.background_sequences = state['primer_collection']['params']['background_seq'];
            this.target_regions       = state['sequences'];

            // Init PCR
            pcr_salts_inputs[0].value = this.pcr_salts['Na'];
            pcr_salts_inputs[1].value = this.pcr_salts['K'];
            pcr_salts_inputs[2].value = this.pcr_salts['Tris'];
            pcr_salts_inputs[3].value = this.pcr_salts['Mg'];
            pcr_salts_inputs[4].value = this.pcr_salts['dNTPs'];

            // Init background sequences
            updateBackgroundSequences();

            // Init target region list
            for(let key in this.target_regions) {
                console.log(key);
                console.log(this.target_regions[key]);
                let sequence = this.target_regions[key]['seq'];
                let target_start = this.target_regions[key]['target_start'];
                let target_end = this.target_regions[key]['target_end'];
                let length_min = this.target_regions[key]['primer_len_range']['min'];
                let length_max = this.target_regions[key]['primer_len_range']['max'];
                addNewTargetRegionIdentifier(key, sequence, target_start, target_end, length_min, length_max);
            }
        }

        // Init PCR
        pcr_salts_inputs[0].value = this.pcr_salts['Na'];
        pcr_salts_inputs[1].value = this.pcr_salts['K'];
        pcr_salts_inputs[2].value = this.pcr_salts['Tris'];
        pcr_salts_inputs[3].value = this.pcr_salts['Mg'];
        pcr_salts_inputs[4].value = this.pcr_salts['dNTPs'];

        // Init defaults in Target Regions to sane values
        default_target_start.value = 1;
        default_target_end.value = 50;
        default_min_length.value = 18;
        default_max_length.value = 22;
    }

    /**
     *  output a JSON object version of the current module state
     */
    toJSON() {
        let out = {}
        out['sequences'] = this.target_regions;
        out['primer_collection'] = {};
        out['primer_collection']['params'] = {};
        out['primer_collection']['params']['pcr_salts'] = this.pcr_salts;
        out['primer_collection']['params']['background_seq'] = this.background_sequences;

        return out;
    }

    /**
     *  Update the value of a PCR salt
     *
     * @param salt PCR salt value to update
     * @param value number to change PCD salt value to
     */
    updatePCR(salt, value) {
        switch(salt) {
            case 'pcr_na':
                this.pcr_salts['Na'] = value;
                return;

            case 'pcr_k':
                this.pcr_salts['K'] = value;
                return;

            case 'pcr_mg':
                this.pcr_salts['Mg'] = value;
                return;

            case 'pcr_tris':
                this.pcr_salts['Tris'] = value;
                return;

            case 'pcr_dntps':
                this.pcr_salts['dNTPs'] = value;
                return;
        }
    }

    /**
     *  Add a background sequence to the list
     *
     * @param sequence_path file path to background sequence file
     */
    addBackgroundSequence(sequence_path) {
        this.background_sequences.push(sequence_path);
    }

    /**
     *  Remove a background sequence from the list
     *
     * @param sequence_path file path to background sequence file
     */
    removeBackgroundSequence(sequence_path) {
        this.background_sequences.splice(this.background_sequences.indexOf(sequence_path), 1);
    }

    /**
     *  Get a target region identifier, if applicable
     *
     * @param label label of the target region
     */
    getTargetRegionIdentifier(label) {
        if(label in this.target_regions) {
            return this.target_regions[label];
        } else {
            return null;
        }
    }

    /**
     * Add a new target region identifier
     *
     * @param label Label of the target region
     * @param sequence Neucleotide sequence
     * @param target_start (optional) target start
     * @param target_end (optional) target end
     * @param min_length (optional) minimum length of primer
     * @param max_length (optional) maximum length of primer
     *
     * @return true sequence identifier successfuly added
     * @return false sequence identifier not added, likely due to duplicate sequence labels
     */
    addTargetRegionIdentifier(label, sequence, target_start=null, target_end=null, min_length=null, max_length=null) {
        // Check if the label is already in the list
        if(label in this.target_regions) {
            return false;
        }

        this.target_regions[label] = {
            'seq': sequence.toString(),
            'target_start': target_start-1,
            'target_end': target_end-1,
            'primer_len_range': {
                'min': min_length,
                'max': max_length
            }
        };

        return true;
    }

    /**
     *  Remove a target region identifier
     *
     * @param label Label of the target region
     *
     * @return true Identifier successfully removed
     * @return false Identifier not found
     */
    removeTargetRegionIdentifier(label) {
        if(label in this.target_regions) {
            delete this.target_regions[label];
            return true;

        } else {
            return false;
        }
    }

    /**
     *  Alter a target region identifier
     *
     * @param label Label of the target region
     * @param sequence Neucleotide sequence
     * @param target_start (optional) target start
     * @param target_end (optional) target end
     * @param min_length (optional) minimum length of primer
     * @param max_length (optional) maximum length of primer
     *
     * @return true sequence identifier successfully altered
     * @return false error in altering sequence identifier
     */
    alterTargetRegionIdentifier(label, target_start=null, target_end=null, min_length=null, max_length=null) {
        if(!(label in this.target_regions)) {
            return false;
        }

        if(target_start) {
            this.target_regions[label]['target_start'] = target_start-1;
        }

        if(target_end) {
            this.target_regions[label]['target_end'] = target_end-1;
        }

        if(min_length) {
            this.target_regions[label]['primer_len_range']['min'] = min_length;
        }

        if(max_length) {
            this.target_regions[label]['primer_len_range']['max'] = max_length;
        }

        return true;
    }
}


// set up listeners for PCR Salts
for(let i = 0; i < pcr_salts_inputs.length; i++) {
    pcr_salts_inputs[i].addEventListener('change', function() {
        let id = this.id;
        if(this.value >= 0) {
            state.updatePCR(id, parseInt(this.value));
        } else {
            if(state.pcr_salts[this.id] != undefined) {
                this.value = state.pcr_salts[this.id];
            } else {
                this.value = 0;
            }
        }
    });
}


/**
 *  Set up the background sequence list. Add a click remove event listener
 *        on each background sequence.
 */
function updateBackgroundSequences() {
    let background_seq_list = document.querySelector('#background_seq_list');
    background_seq_list.innerHTML = "";
    let background_sequences = state.background_sequences;

    for(let i = 0; i < background_sequences.length; i++) {
        let row = background_seq_list.insertRow();
        let cell = row.insertCell();

        cell.innerHTML = background_sequences[i].split('/').pop();

        // Add event listener for removal of background sequences
        cell.addEventListener('click', function() {
            state.removeBackgroundSequence(this.innerHTML);
            updateBackgroundSequences();
        });
    }
}


// set up event listener for background sequence addition
background_seq_fp.addEventListener('change', function() {
    let path = background_seq_fp.files[0].path;
    state.addBackgroundSequence(path);

    background_seq_fp.value = '';

    updateBackgroundSequences();
});


/**
 *  Remove a target region from the list in the DOM
 */
function removeTargetRegionIdentifier(identifier) {
    if(!state.removeTargetRegionIdentifier(identifier)) {
        return false;
    }

    let identifiers = document.querySelectorAll('#sequence_identifiers > table');

    for(let i = 0; i < identifiers.length; i++) {
        let table = identifiers[i];
        if(table.rows[0].cells[0].childNodes[0].innerHTML == identifier) {
            table.remove();
            return true;
        }
    }

    return false;
}


/**
 *  Add a new target region identifier to the list on the DOM
 *
 * @param identifier_label
 * @param sequence
 * @param target_start
 * @param target_end
 * @param min_length
 * @param max_length
 *
 * @return true identifier added to list in DOM
 * @return false identifier was not added
 */
function addNewTargetRegionIdentifier(identifier_label, sequence, target_start=null, target_end=null, min_length=null, max_length=null) {
    // For all null values, replace with the values in the defaults section
    if(!target_start) {
        target_start = parseInt(default_target_start.value);
    }

    if(!target_end) {
        target_end = parseInt(default_target_end.value);
    }

    if(!min_length) {
        min_length = parseInt(default_min_length.value);
    }

    if(!max_length) {
        max_length = parseInt(default_max_length.value);
    }

    // Add the data to the Module1 class instance. If there's a problem (eg label already exists), abort
    if(!state.addTargetRegionIdentifier(identifier_label, sequence, target_start, target_end, min_length, max_length)) {
        return false;
    }

    let identifiers = document.querySelector('#sequence_identifiers');

    // Create a new table
    let table = document.createElement('table');
    table.className = 'input_table';
    let row = table.insertRow(0);

    identifiers.appendChild(table);

    let cell = row.insertCell();

    // create label
    let label = document.createElement('div');
    let target_region = document.createElement('div');
    let target_start_label = document.createElement('div');
    let target_start_input = document.createElement('input');
    let target_end_label = document.createElement('div');
    let target_end_input = document.createElement('input');
    let length_min_label = document.createElement('div');
    let length_min_input = document.createElement('input');
    let length_max_label = document.createElement('div');
    let length_max_input = document.createElement('input');
    let remove_button = document.createElement('input');

    label.className = 'sequence_name';
    label.innerHTML = identifier_label;
    cell.appendChild(label);

    // create target region label
    target_region.className = 'target_region';

    // attempt to populate the target region, if applicable
    if(target_start && target_end) {
        target_region.innerHTML = sequence.substring(target_start, target_end);
    }

    cell.appendChild(target_region);

    // create target start label
    cell = row.insertCell();

    target_start_label.innerHTML = 'Target Start:';

    target_start_input.setAttribute('type', 'number');
    target_start_input.className = 'target_start';

    if(target_start) {
        target_start_input.value = target_start;
    }

    target_start_input.addEventListener('change', function(event) {
        if(this.value < 1) {
            this.value = 1;
        }

        if(parseInt(target_end_input.value) - parseInt(this.value) < 50) {
            target_end_input.value = parseInt(this.value) + 50;
            target_end_input.dispatchEvent(new Event('change'));
        }

        if(parseInt(this.value) > state.getTargetRegionIdentifier(identifier_label).seq.length) {
            this.value = state.getTargetRegionIdentifier(identifier_label).seq.length - 50;
        }

        state.alterTargetRegionIdentifier(identifier_label, target_start=parseInt(this.value), null, null, null);

        let target_region = state.getTargetRegionIdentifier(identifier_label);

        let seq   = target_region['seq'];
        let start = target_region['target_start'];
        let end   = target_region['target_end'];

        // change the target region label
        event.target.parentElement.parentElement.querySelector('.target_region').innerHTML = seq.substring(start, end);
    });

    cell.appendChild(target_start_label);
    cell.appendChild(target_start_input);

    // create target end label
    cell = row.insertCell();

    target_end_label.innerHTML = 'Target End:';

    target_end_input.setAttribute('type', 'number');
    target_end_input.className = 'target_end';

    if(target_end) {
        target_end_input.value = target_end;
    }

    target_end_input.addEventListener('change', function() {
        if(parseInt(this.value) < 1) {
            this.value = 1;
        }

        if(parseInt(this.value) - parseInt(target_start_input.value) < 50) {
            target_start_input.value = parseInt(this.value) - 50;
            target_start_input.dispatchEvent(new Event('change'));
        }

        if(parseInt(this.value) > state.getTargetRegionIdentifier(identifier_label).seq.length) {
            this.value = state.getTargetRegionIdentifier(identifier_label).seq.length;
        }

        state.alterTargetRegionIdentifier(identifier_label, null, target_end=parseInt(this.value), null, null);

        let target_region = state.getTargetRegionIdentifier(identifier_label);

        let seq   = target_region['seq'];
        let start = target_region['target_start'];
        let end   = target_region['target_end'];

        // change the target region label
        event.target.parentElement.parentElement.querySelector('.target_region').innerHTML = seq.substring(start, end);
    });

    cell.appendChild(target_end_label);
    cell.appendChild(target_end_input);

    // create min length
    cell = row.insertCell();

    length_min_label.innerHTML = 'Min Length:';

    length_min_input.setAttribute('type', 'number');
    length_min_input.className = 'length_min';

    if(min_length) {
        length_min_input.value = min_length;
    }

    length_min_input.addEventListener('change', function() {
        if(parseInt(this.value) < 18) {
            this.value = 18;
        }

        if(parseInt(length_max_input.value) <= parseInt(this.value)) {
            length_max_input.value = parseInt(this.value) + 1;
        }

        state.alterTargetRegionIdentifier(identifier_label, null, null, length_min=parseInt(this.value), null);
    });

    cell.appendChild(length_min_label);
    cell.appendChild(length_min_input);

    // create max length
    cell = row.insertCell();

    length_max_label.innerHTML = 'Max Length:';

    length_max_input.setAttribute('type', 'number');
    length_max_input.className = 'length_max';

    if(max_length) {
        length_max_input.value = max_length;
    }

    length_max_input.addEventListener('change', function() {
        if(parseInt(this.value) < 22) {
            this.value = 22;
        }

        if(length_min_input.value > this.value) {
            length_min_input.value = parseInt(this.value) - 1;
        }

        state.alterTargetRegionIdentifier(identifier_label, null, null, null, length_max=parseInt(this.value));
    });

    cell.appendChild(length_max_label);
    cell.appendChild(length_max_input);

    cell = row.insertCell();
    remove_button.setAttribute('type', 'submit');
    remove_button.setAttribute('value', 'Remove');
    remove_button.addEventListener('click', function() {
        removeTargetRegionIdentifier(identifier_label);
    });

    cell.appendChild(remove_button);
    return true;
}


/**
 * search the target sequence identifiers for any matches, and highlight
 * any hits
 *
 * @param search_str string to search both the labels and FASTA sequences
 */
function search(search_str) {
    // get a list of target sequences
    target_sequences = document.querySelectorAll('#sequence_identifiers > table');

    search_str = search_str.split(';');

    // clear out previous searches
    for(let i = 0; i < target_sequences.length; i++) {
        let element = target_sequences[i];
        element.classList.remove('selected');
    }

    // for each query, highlight any matches
    for(let query = 0; query < search_str.length; query++) {
        for(let i = 0; i < target_sequences.length; i++) {
            let element = target_sequences[i];

            let sequence = element.querySelector('.target_region').innerHTML;
            let label    = element.querySelector('.sequence_name').innerHTML;

            if(sequence.search(search_str[query]) >= 0 || label.search(search_str[query]) >= 0) {
                element.classList.add('selected');
            }
        }
    }
}


// bulk change all current target region identifiers to have the values in the defaults
change_all.addEventListener('click', function() {
    // alter the values in the needed target sequence inputs
    let elements = document.querySelectorAll('#sequence_identifiers > .input_table');

    let target_start = parseInt(default_target_start.value);
    let target_end = parseInt(default_target_end.value);
    let min_length = parseInt(default_min_length.value);
    let max_length = parseInt(default_max_length.value);

    // scan through the target region identifiers, find the corrent one, and inject the values
    for(let j = 0; j < elements.length; j++) {
        let inputs = elements[j].querySelectorAll('input');

        inputs[0].value = target_start;
        inputs[1].value = target_end;
        inputs[2].value = min_length;
        inputs[3].value = max_length;

        for(let j = 0; j < 4; j++) {
            inputs[i].dispatchEvent(new Event('change'));
        }
    }
});


// Event listener for sequence identifier manual entry
manual_submit.addEventListener('click', function() {
    let manual_label    = document.getElementById('manual_label');
    let manual_sequence = document.getElementById('manual_sequence');

    let label    = manual_label.value;
    let sequence = manual_sequence.value;

    if(!validate.validateFasta(sequence) || label.value == '' || sequence.value == '') {
        return;
    }

    if(addNewTargetRegionIdentifier(label, sequence)) {
        manual_label.value    = '';
        manual_sequence.value = '';
    }

});


// Event listener for sequence identifier bulk upload
bulk_upload.addEventListener('change', function() {
    console.log("FASTA file change");

    // Read in the data from the file
    fs.readFile(bulk_upload.files[0].path, function(err, data) {
        if(err) {
            console.log("FASTA file read error");
        }

        let fasta_raw_string = data.toString();
        fasta_raw_string = fasta_raw_string.split(/\n/);

        let current_sequence = '';
        let current_header = null;

        for(let line of fasta_raw_string) {
            if('>' == line[0]) {
                if(!current_header) {
                    current_header = line.replace(new RegExp('>'), '');
                    continue;
                } else {
                    if(validate.validateFasta(current_sequence)) {
                        addNewTargetRegionIdentifier(current_header, current_sequence);
                    }
                    current_header = line.replace(new RegExp('>'), '');
                    current_sequence = '';
                    continue;
                }
            } else {
                current_sequence += line;
                current_sequence = current_sequence.replace(/\s/g, '');
            }
        }

        if(current_sequence != '' && validate.validateFasta(current_sequence)) {
            addNewTargetRegionIdentifier(current_header, current_sequence);
        }
    });

    bulk_upload.value = '';
});


/**
 * Parse and add incomming metadata to appropriate target region identifiers
 *
 * @listens change
 */
metadata_upload.addEventListener('change', function() {
    console.log('new metadata');

    // attempt to parse the metadata
    papa.parse(metadata_upload.files[0], {
	    complete: function(results) {
            let keys = results.data[0];
            for(let i = 1; i < results.data.length; i++) {
                if(results.data[i].length != keys.length) {
                    continue;
                }

                let values = {
                    'label': null,
                    'target_start': null,
                    'target_end': null,
                    'min_length': null,
                    'max_length': null
                }

                for(let j = 0; j < results.data[i].length; j++) {
                    values[keys[j]] = results.data[i][j];
                }

                // check if current metadata is complete
                let good = true;
                for(key in values) {
                    if(!values[key]) {
                        good = false;
                        break;
                    }
                }

                if(!good) {
                    continue;
                }

                // check if target region exists in the current state
                if(!state.getTargetRegionIdentifier(values['label'])) {
                    continue;
                }

                // alter the values in the needed target sequence inputs
                let elements = document.querySelectorAll('#sequence_identifiers > .input_table');

                // scan through the target region identifiers, find the corrent one, and inject the values
                for(let j = 0; j < elements.length; j++) {
                    let label = elements[j].querySelector('.sequence_name');
                    if(label.innerHTML == values['label']) {
                        let inputs = elements[j].querySelectorAll('input');

                        inputs[0].value = values['target_start'];
                        inputs[1].value = values['target_end'];
                        inputs[2].value = values['min_length'];
                        inputs[3].value = values['max_length'];
                    }
                }
            }
        }
    });
});


/**
 * helper function for sending IPC messages
 *
 * @param channel IPC channel
 * @param message payload
 */
function sendMessage(channel, message) {
    ipcRenderer.send(channel, message);
}


/**
 * Listen for incoming searched
 *
 * @listens change
 */
search_box.addEventListener('change', function() {
    search(search_box.value);
    console.log("searching for " + search_box.value);
});


/**
 * Listen for loading module 2
 *
 * @listens click
 */
module_2.addEventListener('click', function() {
    sendMessage('LOADMODULE', 2);
    console.log('attempting to load module 2');
});


/**
 * Listen for loading module 3
 *
 * @listens click
 */
module_3.addEventListener('click', function() {
    sendMessage('LOADMODULE', 3);
    console.log('attempting to load module 3');
});


/**
 * Execute the primacy module on the command line
 *
 * @listens click
 */
execute.addEventListener('click', function() {
    sendMessage('EXECUTE', ['primacy primer-collection', JSON.stringify(state.toJSON())]);
    console.log('attempting execution');
})


/**
 * Load the next module
 *
 * @listens click
 */
submit.addEventListener('click', function() {
    sendMessage('LOADMODULE', 2);
    console.log('attempting execution');
})

/**
 * Intercept NEW message and bootstrap the page
 */
ipcRenderer.on('NEW', (event, arg) => {
    console.log("NEW Recieved:");
    state = new Module1(JSON.parse(arg));
});


// Intercept response to EXECUTE request
ipcRenderer.on('EXECUTE', (event, arg) => {
    if(arg != null) {
        console.log('Error during pipeline execution:');
        console.log(arg);
    } else {
        sendMessage('LOADVIZ', 1);
        submit.style.display = 'inline-block';
    }
});


/**
 * Intercept module load denials
 */
ipcRenderer.on('LOADMODULE', (event, arg) => {
    console.log('Module load denied');
    submit.style.borderColor = "red";
    setTimeout(function(){
      submit.style.borderColor = "block";
    }, 150);

});


/**
 * Clean init of state if nothing to bootstrap from
 */
if(!state) {
    state = new Module1();
    submit.style.display = 'none';
}
