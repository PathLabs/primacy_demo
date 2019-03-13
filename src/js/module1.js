/**
 * @file module1.js
 *
 * @brief JS for Primacy GUI Module 1: Primer Collection
 *
 * @author Chance Nelson <chance-nelson@nau.edu>
 */




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
    constructor(previous_state=null) {
        this.target_regions = [];
        
        this.background_sequences = [];
        
        this.pcr_salts = {
            'Na': 50,
            'K': 0,
            'Tris': 0,
            'Mg': 0,
            'dNTPs': 0
        };
    }

    /**
     * @brief Update the value of a PCR salt
     *
     * @param salt PCR salt value to update
     * @param value number to change PCD salt value to
     */
    updatePCR(salt, value) {
        switch(salt) {
            case 'Na': 
                this.pcr_salts['Na'] = value;
                return;

            case 'K': 
                this.pcr_salts['K'] = value;
                return;
            
            case 'Mg': 
                this.pcr_salts['Mg'] = value;
                return;
            
            case 'Tris': 
                this.pcr_salts['Tris'] = value;
                return;
            
            case 'dNTPs': 
                this.pcr_salts['dNTPS'] = value;
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
     */
    addTargetRegionIdentifier(label, sequence, target_start=null, target_end=null, min_length=null, max_length=null) {
        target_region_obj = {};
        target_region_obj[label.toString()] = {
            'seq': sequence.toString(),
            'target_start': target_start,
            'target_end': target_end,
            'primer_len_range': {
                'min': min_length,
                'max': max_length
            }
        };   
        
        
        this.target_regions.push(target_region_obj);
    }
    
    /**
     * @param Remove a target region identifier
     *
     * @param label Label of the target region
     *
     * @return true Identifier successfully removed
     * @return false Identifier not found
     */
    removeTargetRegionIdentifier(label) {
        for(let i = 0; i < this.target_regions.length; i++) {
            if(this.target_regions[i].hasOwnProperty(label)) {
                this.target_regions.splice(i, 1);
                return true;
            }

            return false;
        }
    }
}


// set up listeners for PCR Salts
const pcr_salts_inputs = document.querySelectorAll('#pcr > tbody > tr > td > input');
for(let i = 0; i < pcr_salts_inputs.length; i++) {
    pcr_salts_inputs[i].addEventListener('change', function() {
        let id = this.id;
        state.updatePCR(id, parseInt(this.value));
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
const background_seq_fp = document.querySelector('#background_seq_fp');
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
    let identifiers = document.querySelectorAll('#sequence_identifiers > table');

    console.log(identifiers);

    for(let i = 0; i < identifiers.length; i++) {
        let table = identifiers[i];
        if(table.rows[0].cells[0].childNodes[0].innerHTML == identifier) {
            table.remove();
            return;
        }
    }
}


/**
 * @brief Add a new target region identifier to the list on the DOM
 */
function addNewTargetRegionIdentifier(identifier_label, target_start=null, target_end=null, min_length=null, max_length=null) {
    let identifiers = document.querySelector('#sequence_identifiers');
    
    // Create a new table
    let table = document.createElement('table');
    table.className = 'input_table';
    let row = table.insertRow(0);
    
    identifiers.appendChild(table);

    // Add sequence label
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

    cell.appendChild(target_start_label);
    cell.appendChild(target_start_input);

    // create target end label
    cell = row.insertCell();
    
    let target_end_label = document.createElement('div');
    target_end_label.innerHTML = 'Target End:';
    
    let target_end_input = document.createElement('input');
    target_end_input.setAttribute('type', 'number');
    target_end_input.className = 'target_end';

    cell.appendChild(target_end_label);
    cell.appendChild(target_end_input);

    // create min length
    cell = row.insertCell();
    
    let length_min_label = document.createElement('div');
    length_min_label.innerHTML = 'Min Length:';
    
    let length_min_input = document.createElement('input');
    length_min_input.setAttribute('type', 'number');
    length_min_input.className = 'length_min';

    cell.appendChild(length_min_label);
    cell.appendChild(length_min_input);

    // create max length
    cell = row.insertCell();
    
    let length_max_label = document.createElement('div');
    length_max_label.innerHTML = 'Max Length:';
    
    let length_max_input = document.createElement('input');
    length_max_input.setAttribute('type', 'number');
    length_max_input.className = 'length_max';

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

}


var state = new Module1();
