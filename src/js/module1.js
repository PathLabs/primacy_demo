/**
 * Desc: Listens to replys from main.js
 * Acts as a Library of helper functions for executing primacy pipeline commands
 *
 * Authors:
 *      - Austin Kelly <ak678@nau.edu>
 *      - Chance Nelson <chance-nelson@nau.edu>
 */

const module1                      = document.getElementById("module1");
const module2                      = document.getElementById("module2");
const submit_button                = document.getElementById("submitButton");
const reset_button                 = document.getElementById("resetButton");
const fasta_file_select            = document.getElementById("fastaFileSelect");
const fasta_file_textarea          = document.getElementById("fastaTextInput");

const pcr_sodium       = document.getElementById("pcrsodium");
const pcr_potassium    = document.getElementById("pcrpotassium");
const pcr_tromethamine = document.getElementById("pcrtromethamine");
const pcr_magnesium    = document.getElementById("pcrmagnesium");
const pcr_dntps        = document.getElementById("pcrdntps");

const background_sequence_filepicker = document.getElementById("backgroundseqfilepicker");
const background_sequence_table      = document.getElementById("backgroundseqtable");


/**
 * @brief Template for a background sequence
 */
var background_template = {
    file: null 
};

/**
 * @brief Array of all selected files for 
 */
var background_sequences = [];

/**
 * @brief Template for a nucleotide sequence
 */
class Sequence {
    constructor(identifier, nucleotide_sequence, ranges) {
        this.identifier = identifier;
        this.nucleotide_sequence = nucleotide_sequence;
        this.ranges = ranges;
    }
};

/**
 * @brief array of sequences currently available for user input 
 *
 * Start the sequence array with a single template sequence
 */
var sequences = [new Sequence('', '', [])];


//gets users home directory
const os = require('os');
const fs = require('fs');

const validate = require('../js/input_validation.js');

const {ipcRenderer} = require('electron');


/**
 * @brief create a new fasta sequence selector
 *
 * copies the first HTML select container, and also pushes a new template
 * sequence JSON object to the array of sequences available. The id of the
 * container is set to 'sequence#' where '#' is the index of the sequence
 * array
 *
 * @param fasta_seq fasta sequence string
 * @param seq_identifier identifier for the sequence
 * @param lower_range lower range selection, can be undefined
 * @param upper_range upper range selection, can be undefined
 */
function createNewSequenceSelector(fasta_seq, seq_identifier, lower_range, upper_range) {
    // push a new sequence to the array, get the index of this new sequence
    let new_sequence = new Sequence(seq_identifier, fasta_seq, [lower_range, upper_range]);

    let index = sequences.push(new_sequence) - 1; 

    console.log(index);

    // Get the first sequence container's html
    let first_sequence_container = document.getElementsByClassName('fasta_selector')[0];

    // Perform a full clone (all children)
    let new_container = first_sequence_container.cloneNode(true);

    console.log("new container:", new_container);

    document.getElementById('neucleotide_input').appendChild(new_container);

    // Set up the text inputs, and sequence selection tables
    let new_element = document.getElementsByClassName('fasta_selector')[index];
    
    let input_table_element = new_element.querySelector('#regionpicker');
    let lower_range_element = new_element.querySelector('#startrange');
    let upper_range_element = new_element.querySelector('#endrange');

    if(lower_range) {
        lower_range_element.value = parseInt(lower_range);
        sequences[index].ranges.push(lower_range);
    }

    if(upper_range) {
        upper_range_element.value = parseInt(upper_range);
        sequences[index].ranges.push(upper_range);
    }

    // Set the sequence identifier
    let sequence_identifier = new_element.querySelector('#sequenceidentifier');

    sequence_identifier.value = new_sequence.identifier;
    // Initialize the sequence picker table
    updateFastaSequenceTable(input_table_element, index);

    // If there are ranges, highlight in the table
    if(lower_range && upper_range) {
        console.log("Highlighting");
        highlightFastaSequence(index);
    }
} 

/**
 * @brief update/reset a FASTA selection table
 *
 * @param table_element HTML DOM element for the selection table
 * @param sequence_index index in the array 'sequences' for the primer
 *                       selection object
 */
function updateFastaSequenceTable(table_element, sequence_index) {
    table_element.deleteRow(0);  // Remove current sequence

    let sequence = sequences[sequence_index].nucleotide_sequence;

    let row = table_element.insertRow(0);
    for(i = 0; i < sequence.length; i++) {
        var click_count = 0;
        let cell        = row.insertCell(i);
        cell.id         = i.toString();

        cell.classList.add('sequence_item');

        cell.innerHTML = sequence[i];

        if(cell.innerHTML == "A"){
            cell.style.color="rgb(255,130,130)";
        }
        if(cell.innerHTML == "G"){
            cell.style.color="rgb(130,130,255)";
        }
        if(cell.innerHTML == "C"){
            cell.style.color="rgb(130,255,130)";
        }
        if(cell.innerHTML == "T"){
            cell.style.color="rgb(255,130,255)";
        }

        cell.addEventListener('click', function() {
            cell.style.backgroundColor = "green";
            cell.style.color           = "white";

            console.log(sequence_index, sequences[sequence_index]);
            sequences[sequence_index].ranges.push(parseInt(this.id));

            while(sequences[sequence_index].ranges.length > 2) {
                sequences[sequence_index].ranges.shift();
            }

            if(sequences[sequence_index].ranges.length == 2) {
                highlightFastaSequence(sequence_index);
            }

        });
    }
}


/**
 * @brief highlight a selection in a FASTA selection table
 *
 * @param sequence_index index of the 'sequences' array that points to the
 *                       primer selection object
 */
function highlightFastaSequence(sequence_index) {
    let ranges = sequences[sequence_index].ranges;
    let selector_element = document.getElementsByClassName('fasta_selector')[sequence_index];

    let lower_range = selector_element.querySelector('#startrange');
    let upper_range = selector_element.querySelector('#endrange');

    temp  = parseInt(ranges[0]);
    temp2 = parseInt(ranges[1]);

    if(temp > temp2) {
        lower_range.value    = temp2;
        upper_range.value    = temp;
        sequence_start_range = temp2;
        sequence_end_range   = temp;
    } else {
        lower_range.value    = temp;
        upper_range.value    = temp2;
        sequence_start_range = temp;
        sequence_end_range   = temp2;
    }

    sequence_start_range = parseInt(sequence_start_range);
    sequence_end_range = parseInt(sequence_end_range);

    // Highlight every cell between the lower and upper range
    let cells = selector_element.getElementsByClassName('sequence_item');//.slice(sequence_start_range, sequence_end_range);
    console.log(cells);
    for(let cell_index = sequence_start_range; cell_index < sequence_end_range; cell_index++) {
        cells[cell_index].style.backgroundColor = "green";
        cells[cell_index].style.color           = "white";
    }
}

/**
 * @brief send a message to the main thread
 *
 * @param channel channel to send message on. Can be 'EXECUTE', 'LOADMODULE', etc
 * @param message message to send
 */
function sendMessage(channel, message){
    ipcRenderer.send(channel, message);
}

function init(json_string){
    result_json = json_string;

    if(result_json) {

    } else {
        pcr_sodium.value       = "50";
        pcr_magnesium.value    = "0";
        pcr_tromethamine.value = "0";
        pcr_potassium.value    = "0";
        pcr_dntps.value        = "0";
    }
}

function updateSequenceIdentifierTextarea() {
    sequence_identifier_textarea.value = fasta_header;
}

function updateBackgroundSequences() {
    table = background_sequence_table;

    table.innerHTML = "";

    for(i = 0; i < background_sequences.length; i++) {
        let row  = table.insertRow(i);
        let cell = row.insertCell(0);

        cell.innerHTML = background_sequences[i];
        cell.addEventListener("click", function() {
            for(i = 0; i < background_sequences.length; i++) {
                if(this.innerHTML == background_sequences[i]) {
                    background_sequences.splice(i, 1);
                }
            }

            updateBackgroundSequences();
        });
    }
}


//listening
ipcRenderer.on('EXECUTE', (event, arg) =>{
    if(arg != null){
        console.log("error received");
    } else {
        console.log("sending load message");
        sendMessage('LOADMODULE', 1);
    }
});

ipcRenderer.on('NEW', (event, arg) =>{
    console.log("NEW received");
    console.log(fasta_file_select.value);
    init(arg[0]);
});

ipcRenderer.on('LOADMODULE', (event, arg) =>{
    console.log("DENIED");
})

//loads tab on click
module2.addEventListener('click', function (){
    console.log("click");
    sendMessage('LOADMODULE', 1);
});

resetButton.addEventListener('click', function() {
    // TODO: resetTable();
});

submitButton.addEventListener('click', function () {
    let out_json = {};
   
    out_json.sequences = {};

    let sequence_array = [];
    for(let i = 0; i < sequences.length; i++) {
        let current_sequence = sequences[i];
        
        if(current_sequence.identifier == '') {
            continue;
        }
        
        current_sequence.ranges.sort();
        out_json.sequences[current_sequence.identifier] = {
            seq: current_sequence.nucleotide_sequence,
            target_start: current_sequence.ranges[0],
            target_end: current_sequence.ranges[1],
            
            // TODO: primer length ranges
            primer_len_range: {
                min: 18,
                max: 22
            }
        };
    }
  
    out_json.primer_collection                   = {};
    out_json.primer_collection.params            = {};
    out_json.primer_collection.params.pcr_salts  = {};

    out_json.primer_collection.params.pcr_salts.na    = pcr_sodium.value.toString();
    out_json.primer_collection.params.pcr_salts.k     = pcr_potassium.value.toString();
    out_json.primer_collection.params.pcr_salts.tris  = pcr_tromethamine.value.toString();
    out_json.primer_collection.params.pcr_salts.mg    = pcr_magnesium.value.toString();
    out_json.primer_collection.params.pcr_salts.dntps = pcr_dntps.value.toString();

    console.log("Created output JSON:")
    console.log(JSON.stringify(out_json));

    sendMessage('EXECUTE', ['module1.py', JSON.stringify(out_json)]);
});

fasta_file_select.addEventListener('change', function() {
    console.log("FASTA file change");

    // Read in the data from the file
    fs.readFile(fasta_file_select.files[0].path, function(err, data) {
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
                    current_header = line;
                    continue;
                } else {
                    createNewSequenceSelector(current_sequence, current_header, undefined, undefined);
                    current_header = line;
                    current_sequence = '';
                    continue;
                }
            } else {
                current_sequence += line;
            }
        }

        if(current_sequence != '') {
            createNewSequenceSelector(current_sequence, current_header, undefined, undefined);
        }
    });

});

background_sequence_filepicker.addEventListener('change', function() {
    path = background_sequence_filepicker.files[0].path;

    // TODO: Validate fasta file

    background_sequences.push(path);

    background_sequence_filepicker.value = "";

    updateBackgroundSequences();
});


init(null);
