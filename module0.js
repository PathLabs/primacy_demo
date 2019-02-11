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
const lower_range                  = document.getElementById("startRange");
const end_range                    = document.getElementById("endRange");
const sequence_identifier_textarea = document.getElementById("sequenceIdentifier");

const pcr_sodium       = document.getElementById("pcrsodium");
const pcr_potassium    = document.getElementById("pcrpotassium");
const pcr_tromethamine = document.getElementById("pcrtromethanime");
const pcr_magnesium    = document.getElementById("pcrmagnesium");

const background_sequence_filepicker = document.getElementById("backgroundseqfilepicker");
const background_sequence_table      = document.getElementById("backgroundseqtable");


var background_sequences = [];

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
    result_json = json_string;
    if(result_json) {
        startRange.value = result_json['range-lower'];
        endRange.value = result_json['range-upper'];
    } else {
        pcr_sodium.value       = "50";
        pcr_magnesium.value    = "0";
        pcr_tromethamine.value = "0";
        pcr_potassium.value    = "0";
    }
    init_run = true;
}

function updateFastaSequenceTable() {
    region_picker_table.deleteRow(0);  // Remove current sequence

    let row = region_picker_table.insertRow(0);
    for(i = 0; i < fasta_nucleotide_sequence.length; i++) {
        var click_count = 0;
        let cell = row.insertCell(i);
        cell.id = i.toString();
        cell.classList.add('sequence_item');
        cell.innerHTML = fasta_nucleotide_sequence[i];
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
            console.log('you clicked', this.id);
            click_count++;
            console.log(click_count);
            cell.style.backgroundColor = "green";
            cell.style.color = "white";

            ranges.push(this.id);

            if(ranges.length == 2) {
                click_count = 0;
                let temp  = ranges.shift();
                let temp2 = ranges.shift();

                temp  = parseInt(temp);
                temp2 = parseInt(temp2);

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

                ranges = [];
                updateRegionAvoidHighlightTable();
            }
        });
    }
}

function updateRegionAvoidHighlightTable() {
    let row = region_picker_table[0];

    for(i = 0; i < sequence_end_range - sequence_start_range; i++) {
        console.log(row);
        let cell = row[i]
        cell.id = i.toString();

        let sequence_index = sequence_start_range + i;

        if(fasta_nucleotide_sequence[sequence_index] == "X") {
            cell.innerHTML = "<span style='color: red;'>" +
                             fasta_nucleotide_sequence[sequence_index]  +
                             "</span>";
        } else {
            cell.innerHTML = "<span style='color: green;'>" +
                             fasta_nucleotide_sequence[sequence_index] +
                             "</span>";
        }
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
