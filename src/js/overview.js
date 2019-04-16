const fs = require("fs");
const path = require("path");
const os = require("os");
const { ipcRenderer } = require("electron");

var table = document.getElementById("feature-table");
var optimize_out_json = JSON.parse(
  fs.readFileSync(
    path.resolve("src/assets/test_targets", "Sa_50_optimize_out.json"),
    "UTF-8"
  )
);
var result = optimize_out_json.set_optimization.result;

for (element in result) {
  var row_f = table.insertRow(1);

  var f_seq_id = row_f.insertCell(0);
  var f_flank = row_f.insertCell(1);
  var f_primer_id = row_f.insertCell(2);
  var f_start = row_f.insertCell(3);
  var f_length = row_f.insertCell(4);
  var f_mm0 = row_f.insertCell(5);
  var f_mm1 = row_f.insertCell(6);
  var f_mm2 = row_f.insertCell(7);
  var f_mm3 = row_f.insertCell(8);
  var f_degenerate = row_f.insertCell(9);
  var f_gc = row_f.insertCell(10);
  var f_gc_clamp = row_f.insertCell(11);
  var f_tm = row_f.insertCell(12);
  var f_homopolymers_percent = row_f.insertCell(13);
  var f_homopolymers_run = row_f.insertCell(14);
  var f_dimerization_percent = row_f.insertCell(15);
  var f_dimerization_run = row_f.insertCell(16);
  var f_dimerization_median = row_f.insertCell(17);
  var f_dimerization_hairpin = row_f.insertCell(18);
  var f_rank = row_f.insertCell(19);
  var f_score = row_f.insertCell(20);
  var f_sequence = row_f.insertCell(21);

  var primer_id = Object.keys(result[element]["forward"])[0];

  f_seq_id.innerHTML = result[element]["forward"][primer_id]["seq_id"];
  f_flank.innerHTML = "forward";
  f_primer_id.innerHTML = primer_id;
  f_start.innerHTML = result[element]["forward"][primer_id]["start"];
  f_length.innerHTML = result[element]["forward"][primer_id]["length"];
  f_mm0.innerHTML = result[element]["forward"][primer_id]["specificity"]["mm0"];
  f_mm1.innerHTML = result[element]["forward"][primer_id]["specificity"]["mm1"];
  f_mm2.innerHTML = result[element]["forward"][primer_id]["specificity"]["mm2"];
  f_mm3.innerHTML = result[element]["forward"][primer_id]["specificity"]["mm3"];
  f_degenerate.innerHTML = result[element]["forward"][primer_id]["degenerate"];
  f_gc.innerHTML = result[element]["forward"][primer_id]["gc"];
  f_gc_clamp.innerHTML = result[element]["forward"][primer_id]["gc_clamp"];
  f_tm.innerHTML = result[element]["forward"][primer_id]["tm"];
  f_homopolymers_percent.innerHTML =
    result[element]["forward"][primer_id]["homopolymers"]["percent"];
  f_homopolymers_run.innerHTML =
    result[element]["forward"][primer_id]["homopolymers"]["run"];
  f_dimerization_percent.innerHTML =
    result[element]["forward"][primer_id]["dimerization"]["percent"];
  f_dimerization_run.innerHTML =
    result[element]["forward"][primer_id]["dimerization"]["run"];
  f_dimerization_median.innerHTML =
    result[element]["forward"][primer_id]["dimerization"]["median"];
  f_dimerization_hairpin.innerHTML =
    result[element]["forward"][primer_id]["dimerization"]["hairpin"];
  f_rank.innerHTML = result[element]["forward"][primer_id]["rank"];
  f_score.innerHTML = result[element]["forward"][primer_id]["score"];
  f_sequence.innerHTML = result[element]["forward"][primer_id]["seq"];

  var row_r = table.insertRow(2);

  var r_seq_id = row_r.insertCell(0);
  var r_flank = row_r.insertCell(1);
  var r_primer_id = row_r.insertCell(2);
  var r_start = row_r.insertCell(3);
  var r_length = row_r.insertCell(4);
  var r_mm0 = row_r.insertCell(5);
  var r_mm1 = row_r.insertCell(6);
  var r_mm2 = row_r.insertCell(7);
  var r_mm3 = row_r.insertCell(8);
  var r_degenerate = row_r.insertCell(9);
  var r_gc = row_r.insertCell(10);
  var r_gc_clamp = row_r.insertCell(11);
  var r_tm = row_r.insertCell(12);
  var r_homopolymers_percent = row_r.insertCell(13);
  var r_homopolymers_run = row_r.insertCell(14);
  var r_dimerization_percent = row_r.insertCell(15);
  var r_dimerization_run = row_r.insertCell(16);
  var r_dimerization_median = row_r.insertCell(17);
  var r_dimerization_hairpin = row_r.insertCell(18);
  var r_rank = row_r.insertCell(19);
  var r_score = row_r.insertCell(20);
  var r_sequence = row_r.insertCell(21);

  primer_id = Object.keys(result[element]["reverse"])[0];

  r_seq_id.innerHTML = result[element]["reverse"][primer_id]["seq_id"];
  r_flank.innerHTML = "reverse";
  r_primer_id.innerHTML = primer_id;
  r_start.innerHTML = result[element]["reverse"][primer_id]["start"];
  r_length.innerHTML = result[element]["reverse"][primer_id]["length"];
  r_mm0.innerHTML = result[element]["reverse"][primer_id]["specificity"]["mm0"];
  r_mm1.innerHTML = result[element]["reverse"][primer_id]["specificity"]["mm1"];
  r_mm2.innerHTML = result[element]["reverse"][primer_id]["specificity"]["mm2"];
  r_mm3.innerHTML = result[element]["reverse"][primer_id]["specificity"]["mm3"];
  r_degenerate.innerHTML = result[element]["reverse"][primer_id]["degenerate"];
  r_gc.innerHTML = result[element]["reverse"][primer_id]["gc"];
  r_gc_clamp.innerHTML = result[element]["reverse"][primer_id]["gc_clamp"];
  r_tm.innerHTML = result[element]["reverse"][primer_id]["tm"];
  r_homopolymers_percent.innerHTML =
    result[element]["reverse"][primer_id]["homopolymers"]["percent"];
  r_homopolymers_run.innerHTML =
    result[element]["reverse"][primer_id]["homopolymers"]["run"];
  r_dimerization_percent.innerHTML =
    result[element]["reverse"][primer_id]["dimerization"]["percent"];
  r_dimerization_run.innerHTML =
    result[element]["reverse"][primer_id]["dimerization"]["run"];
  r_dimerization_median.innerHTML =
    result[element]["reverse"][primer_id]["dimerization"]["median"];
  r_dimerization_hairpin.innerHTML =
    result[element]["reverse"][primer_id]["dimerization"]["hairpin"];
  r_rank.innerHTML = result[element]["reverse"][primer_id]["rank"];
  r_score.innerHTML = result[element]["reverse"][primer_id]["score"];
  r_sequence.innerHTML = result[element]["reverse"][primer_id]["seq"];
}
