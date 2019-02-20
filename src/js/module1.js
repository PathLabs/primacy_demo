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

const region_picker_table          = document.getElementById("regionPicker");
const lower_range                  = document.getElementById("startrange");
const end_range                    = document.getElementById("endrange");
const sequence_identifier_textarea = document.getElementById("sequenceIdentifier");

const pcr_sodium       = document.getElementById("pcrsodium");
const pcr_potassium    = document.getElementById("pcrpotassium");
const pcr_tromethamine = document.getElementById("pcrtromethanime");
const pcr_magnesium    = document.getElementById("pcrmagnesium");

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
var sequence_template = {
    identifier: '',           
    nucleotide_sequence: '',
    ranges: []
};

/**
 * @brief array of sequences currently available for user input 
 *
 * Start the sequence array with a single template sequence
 */
var sequences = [sequence_template];


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
    let new_sequence = sequence_template;

    new_sequence.identifier          = seq_identifier;
    new_sequence.nucleotide_sequence = fasta_seq;

    let index = sequences.push(new_sequence) - 1; 

    // Get the first sequence container's html
    let first_sequence_container = document.getElementsByClassName('fasta_selector')[0];

    // Perform a full clone (including event handlers)
    let new_container = first_sequence_container.cloneNode(true);

    document.getElementById('neucleotide_input').appendChild(new_container);

    // Set up the text inputs, and sequence selection tables
    let new_element = document.getElementsByClassName('fasta_selector')[index];
    
    let input_table_element = new_element.querySelector('#regionpicker');
    let lower_range_element = new_element.querySelector('#startrange');
    let upper_range_element = new_element.querySelector('#endrange');

    // Initialize the sequence picker table
    updateFastaSequenceTable(input_table_element, index);

    // If there are ranges, highlight in the table
    if(lower_range && upper_range) {
        highlightFastaSequence(index);
    }

    if(lower_range) {
        lower_range_element.value = parseInt(lower_range);
    }

    if(upper_range) {
        upper_range_element.value = parseInt(upper_range);
    }

    // Set the sequence identifier
    let sequence_identifier = new_element.querySelector('#sequenceidentifier');
    console.log(sequence_identifier);

    sequence_identifier.value = new_sequence.identifier;
} 

function updateFastaSequenceTable(table_element, sequence_index) {
    table_element.deleteRow(0);  // Remove current sequence

    console.log(sequence_index);
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

        cell.addEventListener('click', function(sequence_index) {
            cell.style.backgroundColor = "green";
            cell.style.color           = "white";

            sequences[sequence_index].ranges.push(this.id);

            if(ranges.length == 2) {
                highlightFastaSequence(sequence_index);
            }

            if(click_count > 2){
                resetTable();
            }
        });
    }
}

function highlightFastaSequence(sequence_index) {
    let ranges = sequences[sequence_index].ranges;
    let selector_element = document.getElementsByClassName('fasta_selector')[sequence_index];
    
    let lower_range = selector_element.querySelector('#startrange');
    let upper_range = selector_element.querySelector('#endrange');

    temp  = parseInt(ranges[0]);
    temp2 = parseInt(ranges[1]);

    if(temp > temp2) {
        lower_range.value    = temp2;
        end_range.value      = temp;
        sequence_start_range = temp2;
        sequence_end_range   = temp;
    } else {
        lower_range.value    = temp;
        end_range.value      = temp2;
        sequence_start_range = temp;
        sequence_end_range   = temp2;
    }

    // Highlight every cell between the lower and upper range
    for(cell = parseInt(lower_range.value); cell < parseInt(end_range.value); cell++) {
        let curr_cell = document.getElementById(cell);
        curr_cell.style.backgroundColor = "green";
        curr_cell.style.color           = "white";
    }

}

function sendMessage(channel, message){
    ipcRenderer.send(channel, message);
}

function init(json_string){
    console.log(json_string);

    result_json = json_string;
/*
    if(result_json) {
        startRange.value = result_json['range-lower'];
        endRange.value   = result_json['range-upper'];
    } else {
        pcr_sodium.value       = "50";
        pcr_magnesium.value    = "0";
        pcr_tromethamine.value = "0";
        pcr_potassium.value    = "0";
    }
    */
}

function resetTable() {
    lower_range.value = "";
    end_range.value   = "";
    ranges            = [];
    updateFastaSequenceTable();
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


function rangeUpdate() {
    console.log(ranges.length);
    switch(ranges.length) {
        // Just add the number to ranges, highlight the table element in green
        case 0:
            ranges.push(parseInt(this.value));
            document.getElementById(this.value).style.color           = "white";
            document.getElementById(this.value).style.backgroundColor = "green";
            break;

        // Add the number to ranges, then update the table
        case 1:
            ranges.push(parseInt(this.value));
            document.getElementById(this.value).style.color           = "white";
            document.getElementById(this.value).style.backgroundColor = "green";
            highlightFastaSequence();
            break;

        default:
            resetTable();
    }

}


lower_range.addEventListener('change', rangeUpdate);
end_range.addEventListener('change', rangeUpdate);


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
    resetTable();
});

submitButton.addEventListener('click', function () {
    try {
        if (startRange && endRange){
            var startString = validate.parseTemperature(startRange.value.toString());
            var endString   = validate.parseTemperature(endRange.value.toString());

            json_string = {'range-lower': startString, 'range-upper': endString, 'file': '"'+file_select.input +'"'};
            json_string = JSON.stringify(json_string);

            sendMessage('EXECUTE', ['primacy.py', json_string]);

            console.log("message sent");
        }
    } catch(e) {
        console.log(e);
    }
});

fasta_file_select.addEventListener('change', function() {
    /**
     * Desc: Reads in a FASTA file and displays it in the
     *       textarea.
     */
    console.log("FASTA file change");

    // Read in the data from the file
    fs.readFile(fasta_file_select.files[0].path, function(err, data) {
        if(err) {
            console.log("FASTA file read error");
        }

        fasta_raw_string = data.toString();


        // If there is a header, split it from the string
        if('>' == fasta_raw_string[0]) {
            console.log("Found header in FASTA file");
            fasta_nucleotide_sequence = fasta_raw_string.split(/\n/);
            fasta_header              = fasta_nucleotide_sequence.shift();
            fasta_nucleotide_sequence = fasta_nucleotide_sequence.join("");
        }

        // Update the nucleotide sequence picker table
        updateFastaSequenceTable();
        updateSequenceIdentifierTextarea();
    });

});

background_sequence_filepicker.addEventListener('change', function() {
    /**
     * Desc: If a file has been added to the background sequence list,
     *       add a new file picker, and set up this event listener
     */

    path = background_sequence_filepicker.files[0].path;

    // TODO: Validate fasta file

    background_sequences.push(path);

    background_sequence_filepicker.value = "";

    updateBackgroundSequences();
});


init('{}');
