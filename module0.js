/**
 * Desc: Listens to replys from main.js
 * Acts as a Library of helper functions for executing primacy pipeline commands
 *
 * Authors:
 *      - Austin Kelly <ak678@nau.edu>
 *      - Chance Nelson <chance-nelson@nau.edu>
 */

const module0                      = document.getElementById("module0");
const module1                      = document.getElementById("module1");
const submit_button                = document.getElementById("submitButton");
const fasta_file_select            = document.getElementById("fastaFileSelect");
const fasta_file_textarea          = document.getElementById("fastaTextInput");
const region_picker_table          = document.getElementById("regionPicker");
const region_avoid_highlight_table = document.getElementById("regionAvoidHighlighter");
const lower_range                  = document.getElementById("startRange");
const end_range                    = document.getElementById("endRange");
const sequence_identifier_textarea = document.getElementById("sequenceIdentifier");


var ranges = [];

var fasta_raw_string          = "";
var fasta_nucleotide_sequence = "";
var fasta_header              = "";

var sequence_start_range = null;
var sequence_end_range   = null;

//gets users home directory
const os = require('os');
const fs = require('fs');

var validate = require('./lib/input_validation.js');

const {ipcRenderer} = require('electron');

//sending
function sendMessage(channel, message){
    ipcRenderer.send(channel, message);
}

function init(json_string){
    console.log(json_string);
    console.log(json_string['range-lower']);
    result_json = json_string;
    startRange.value = result_json['range-lower'];
    endRange.value = result_json['range-upper'];
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
module1.addEventListener('click', function (){
    console.log("click");
    sendMessage('LOADMODULE', 1);
});

submitButton.addEventListener('click', function () {
    try {
        if (startRange && endRange){
            var startString = validate.parseTemperature(startRange.value.toString());
            var endString = validate.parseTemperature(endRange.value.toString());

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

        fasta_file_textarea.value = data.toString();

        // Force the text area's change event to fire
        let change_event = new Event("change");
        fasta_file_textarea.dispatchEvent(change_event);
    });

});

fasta_file_textarea.addEventListener('change', function() {
    /**
     * Desc: Handles fasta sequence changes. Validates the input
     *       and then sets the fasta_sequence variable
     */
    console.log("FASTA sequence textbox change");

    // TODO: Validate current fasta sequence. If not valid do not continue

    fasta_raw_string = fasta_file_textarea.value.toString();

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
