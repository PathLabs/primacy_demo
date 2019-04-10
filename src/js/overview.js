const fs = require('fs');
const path = require('path')
const os            = require('os');
const {ipcRenderer} = require('electron');


var table = document.getElementById('feature-table');
var optimize_out_json = JSON.parse(fs.readFileSync(path.resolve('src/assets/test_targets', 'Sa_50_optimize_out.json' ), 'UTF-8'));
var result = optimize_out_json.set_optimization.result;



for (element in result){
  var row_f = table.insertRow(1);

  var f_seq_id = row_f.insertCell(0);
  var f_flank = row_f.insertCell(1)
  var f_primer_id = row_f.insertCell(2);
  var f_start = row_f.insertCell(3);
  var f_sequence = row_f.insertCell(4);



  f_seq_id.innerHTML = result[element]['forward'][Object.keys(result[element]['forward'])[0]]['seq_id'];
  f_flank.innerHTML = 'forward';
  f_primer_id.innerHTML = Object.keys(result[element]['forward'])[0];
  f_start.innerHTML = result[element]['forward'][Object.keys(result[element]['forward'])[0]]['start'];
  f_sequence.innerHTML = result[element]['forward'][Object.keys(result[element]['forward'])[0]]['seq'];


  var row_r = table.insertRow(2);

  var r_seq_id = row_r.insertCell(0);
  var r_flank = row_r.insertCell(1)
  var r_primer_id = row_r.insertCell(2);
  var r_start = row_r.insertCell(3);
  var r_sequence = row_r.insertCell(4);

  r_seq_id.innerHTML = result[element]['reverse'][Object.keys(result[element]['reverse'])[0]]['seq_id'];
  r_flank.innerHTML = 'reverse';
  r_primer_id.innerHTML = Object.keys(result[element]['reverse'])[0];
  r_start.innerHTML = result[element]['reverse'][Object.keys(result[element]['reverse'])[0]]['start'];
  r_sequence.innerHTML = result[element]['reverse'][Object.keys(result[element]['reverse'])[0]]['seq'];


}
