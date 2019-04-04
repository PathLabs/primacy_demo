/**
 * @file module1.js
 *
 * @brief JS for Primacy GUI Module 1: Primer Collection
 *
 * @author Chance Nelson <chance-nelson@nau.edu>
 */


//gets users home directory
const os = require('os');
const fs = require('fs');

const validate = require('../js/input_validation.js');

const {ipcRenderer} = require('electron');


var state;

const module_2 = document.getElementById('module2');
const pcr_salts_inputs = document.querySelectorAll('#pcr > tbody > tr > td > input');
const background_seq_fp = document.querySelector('#background_seq_fp');
const manual_submit = document.getElementById('manual_submit');
const bulk_upload = document.getElementById('fasta_file_upload');
const module_3 = document.getElementById('module3');
const module_4 = document.getElementById('module4');
const submit = document.getElementById('nextModule');
const default_target_start = document.getElementById('default_target_start');
const default_target_end = document.getElementById('default_target_end');
const default_min_length = document.getElementById('default_min_length');
const default_max_length = document.getElementById('default_max_length');


/**
 * @brief object for the state of module 1
 */
class Module1 {
    /**
     * @brief Constructor for module 1 state. Can accept a JSON object of a
     *        previous state to bootstrap from.
     *
     * @param previous_state JSON object that contains the arguments for
     *        a run of Primacy module 1.
     */
    constructor(state=null) {
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
    }

    /**
     * @brief output a JSON object version of the current module state
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
     * @brief Update the value of a PCR salt
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
     * @brief Add a background sequence to the list
     *
     * @param sequence_path file path to background sequence file
     */
    addBackgroundSequence(sequence_path) {
        this.background_sequences.push(sequence_path);
    }

    /**
     * @brief Remove a background sequence from the list
     *
     * @param sequence_path file path to background sequence file
     */
    removeBackgroundSequence(sequence_path) {
        this.background_sequences.splice(this.background_sequences.indexOf(sequence_path), 1);
    }

    /**
     * @brief Add a new target region identifier
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
            'target_start': target_start,
            'target_end': target_end,
            'primer_len_range': {
                'min': min_length,
                'max': max_length
            }
        };

        return true;
    }

    /**
     * @brief Remove a target region identifier
     *
     * @param label Label of the target region
     *
     * @return true Identifier successfully removed
     * @return false Identifier not found
     */
    removeTargetRegionIdentifier(label) {
        if(label in this.target_regions) {
            delete this.target_regions.label;
            return true;

        } else {
            return false;
        }
    }

    /**
     * @brief Alter a target region identifier
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
            this.target_regions[label]['target_start'] = target_start;
        }

        if(target_end) {
            this.target_regions[label]['target_end'] = target_end;
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
 * @brief Set up the background sequence list. Add a click remove event listener
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
 * @brief Remove a target region from the list in the DOM
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
 * @brief Add a new target region identifier to the list on the DOM
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
    label.className = 'sequence_name';
    label.innerHTML = identifier_label;

    cell.appendChild(label);

    // create target start label
    cell = row.insertCell();

    let target_start_label = document.createElement('div');
    target_start_label.innerHTML = 'Target Start:';

    let target_start_input = document.createElement('input');
    target_start_input.setAttribute('type', 'number');
    target_start_input.className = 'target_start';

    if(target_start) {
        target_start_input.value = target_start;
    }

    target_start_input.addEventListener('change', function() {
        state.alterTargetRegionIdentifier(identifier_label, target_start=parseInt(this.value), null, null, null);
    });

    cell.appendChild(target_start_label);
    cell.appendChild(target_start_input);

    // create target end label
    cell = row.insertCell();

    let target_end_label = document.createElement('div');
    target_end_label.innerHTML = 'Target End:';

    let target_end_input = document.createElement('input');
    target_end_input.setAttribute('type', 'number');
    target_end_input.className = 'target_end';

    if(target_end) {
        target_end_input.value = target_end;
    }

    target_end_input.addEventListener('change', function() {
        state.alterTargetRegionIdentifier(identifier_label, null, target_end=parseInt(this.value), null, null);
    });

    cell.appendChild(target_end_label);
    cell.appendChild(target_end_input);

    // create min length
    cell = row.insertCell();

    let length_min_label = document.createElement('div');
    length_min_label.innerHTML = 'Min Length:';

    let length_min_input = document.createElement('input');
    length_min_input.setAttribute('type', 'number');
    length_min_input.className = 'length_min';

    if(min_length) {
        length_min_input.value = min_length;
    }

    length_min_input.addEventListener('change', function() {
        state.alterTargetRegionIdentifier(identifier_label, null, null, length_min=parseInt(this.value), null);
    });

    cell.appendChild(length_min_label);
    cell.appendChild(length_min_input);

    // create max length
    cell = row.insertCell();

    let length_max_label = document.createElement('div');
    length_max_label.innerHTML = 'Max Length:';

    let length_max_input = document.createElement('input');
    length_max_input.setAttribute('type', 'number');
    length_max_input.className = 'length_max';

    if(max_length) {
        length_max_input.value = max_length;
    }

    length_max_input.addEventListener('change', function() {
        state.alterTargetRegionIdentifier(identifier_label, null, null, null, length_max=parseInt(this.value));
    });

    cell.appendChild(length_max_label);
    cell.appendChild(length_max_input);

    cell = row.insertCell();
    let remove_button = document.createElement('input');
    remove_button.setAttribute('type', 'submit');
    remove_button.setAttribute('value', 'Remove');
    remove_button.addEventListener('click', function() {
        removeTargetRegionIdentifier(identifier_label);
    });

    cell.appendChild(remove_button);
    return true;
}


// Event listener for sequence identifier manual entry
manual_submit.addEventListener('click', function() {
    let manual_label    = document.getElementById('manual_label');
    let manual_sequence = document.getElementById('manual_sequence');

    let label    = manual_label.value;
    let sequence = manual_sequence.value;

    if(!validate.validateFasta(sequence)) {
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
            }
        }

        if(current_sequence != '' && validate.validateFasta(current_sequence)) {
            addNewTargetRegionIdentifier(current_header, current_sequence);
        }
    });

    bulk_upload.value = '';
});


/**
 * @brief helper function for sending IPC messages
 */
function sendMessage(channel, message) {
    ipcRenderer.send(channel, message);
}


module_2.addEventListener('click', function() {
    sendMessage('LOADMODULE', 2);
    console.log('attempting to load module 2');
});


module_3.addEventListener('click', function() {
    sendMessage('LOADMODULE', 3);
    console.log('attempting to load module 3');
});


module_4.addEventListener('click', function() {
    sendMessage('LOADMODULE', 4);
    console.log('attempting to load module 4');
});


submit.addEventListener('click', function() {
    sendMessage('EXECUTE', ['primacy1.py', JSON.stringify(state.toJSON())]);
    console.log('attempting execution');
})


// Intercept NEW message and bootstrap the page
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
        sendMessage('LOADMODULE', 2);
    }
});


// Intercept module load denials
ipcRenderer.on('LOADMODULE', (event, arg) => {
    console.log('Module load denied');
});


// Clean init of state if nothing to bootstrap from
if(!state) {
    state = new Module1();
}
