const fs = require("fs");
const path = require("path");
const os = require("os");
const { ipcRenderer } = require("electron");
// store score values for updating primer counts in the viz
var scores = {'forward': {},
              'reverse': {}
};

// pipeline output after running module 2
var pipeline_mod_2_output = "Sa_50_collection_out.json";


/**
* Desc: This function extracts paths for every single sequence JSON file created after module 2
*
* Args:
*     Path to the module 2 output JSON
*
* Returns:
*      Array containing paths for every single sequence JSON created by module 1
*/


function get_paths(json_file_path) {
  var collection_out = JSON.parse(
    fs.readFileSync(
      path.resolve("src/assets/test_targets", pipeline_mod_2_output),
      "UTF-8"
    )
  );
  collection_out_sequence_ids = Object.keys(collection_out.sequences);
  json_paths = [];
  for (var i = 0; i < collection_out_sequence_ids.length; i++) {
    json_paths.push(
      collection_out.sequences[collection_out_sequence_ids[i]]["outfile"]
    );
  }
  return json_paths;
}

/**
* Desc: This function parses information for the viz from every single sequence JSON
*       created by module 2.
*
* Args:
*     direction (string): this is either 'reverse' or 'forward' and is used to find
*                         respective directional information from the JSON
*
* Returns:
*      Array containing two arrays with x and y values where x is the sequence names and y is the values for the
*      score values (x and y must be the same length and every x value must match the y value)
*/

function parse_data(direction) {
  paths_array = get_paths(pipeline_mod_2_output);
  var xData = [];
  var yData = [];


  if (direction === "forward") {
    for (let i = 0; i < paths_array.length; i++) {
      let data = JSON.parse(
        fs.readFileSync(path.resolve(paths_array[i]), "UTF-8")
      );
        let sequence_id = Object.keys(data)[0];
        let values = [];
        scores.forward[sequence_id] = {};
        xData.unshift(sequence_id);
        forward_primers = Object.keys(data[sequence_id].forward);
        for (let k = 0; k < forward_primers.length; k++) {
          score = data[sequence_id].forward[forward_primers[k]]['score'];
          primer_id = forward_primers[k];
          values.push(score);
          scores.forward[sequence_id][primer_id] = score;
        }
        yData.unshift(values);

    }
  }

  if (direction === "reverse") {
    for (let i = 0; i < paths_array.length; i++) {
      let data = JSON.parse(
        fs.readFileSync(path.resolve(paths_array[i]), "UTF-8")
      );


        var sequence_id = Object.keys(data)[0];
        if (data[sequence_id].hasOwnProperty("reverse")) {
          let values = [];
          scores.reverse[sequence_id] = {};
          xData.unshift(sequence_id);
          reverse_primers = Object.keys(data[sequence_id].reverse);
          for (let k = 0; k < reverse_primers.length; k++) {
            score = data[sequence_id].reverse[reverse_primers[k]]['score'];
            primer_id = reverse_primers[k];
            values.push(score);
            scores.reverse[sequence_id][primer_id] = score;
          }
          yData.unshift(values);
        } else {
          continue;
        }

    }
  }

  return [xData, yData];
}

/**
* Desc: This function creates the d3 based plotly spec which will render the viz
*
* Args:
*     Since this function will be called from within the HTML, the arguments
*     are direction and div (direction to be passed to parse_data())
*
* Returns:
*      None
*/


function create_viz_spec(direction, div) {
  data = parse_data(direction);
  var xData = data[0];
  var yData = data[1];
  var colors = [
    "rgba(93, 164, 214, 0.5)",
    "rgba(255, 144, 14, 0.5)",
    "rgba(44, 160, 101, 0.5)",
    "rgba(255, 65, 54, 0.5)",
    "rgba(207, 114, 255, 0.5)",
    "rgba(127, 96, 0, 0.5)",
    "rgba(255, 140, 184, 0.5)",
    "rgba(79, 90, 117, 0.5)",
    "rgba(222, 223, 0, 0.5)"
  ];

  var data = [];

  for (var i = 0; i < xData.length; i++) {
    var result = {
      type: "box",
      y: yData[i],
      name: xData[i],
      boxpoints: "outliers",
      // jitter: 0.5,
      whiskerwidth: 0.2,
      fillcolor: "cls",
      marker: {
        size: 2
      },
      line: {
        width: 1
      }
    };
    data.push(result);
  }

  layout = {
    title: 'Score' + " Box Plot Chart for " + direction + " primers",
    autosize: false,
    width: 800,
    height: 450,
    yaxis: {
      title: 'Score',
      autorange: true,
      showgrid: true,
      zeroline: true,
      // dtick: 5,
      gridcolor: "rgb(255, 255, 255)",
      gridwidth: 1,
      zerolinecolor: "rgb(255, 255, 255)",
      zerolinewidth: 2
    },
    xaxis:{
      title: 'Sequence ID',
      autorange: true,
      tickmode: 'linear'
    },
    margin: {
      l: 50,
      r: 50,
      b: 100,
      t: 100,
      pad: 0
    },
    paper_bgcolor: "rgb(243, 243, 243)",
    plot_bgcolor: "rgb(243, 243, 243)",
    showlegend: false
  };

  var myPlot = document.getElementById(div);

  Plotly.newPlot(div, data, layout);
}
function update_count_all(direction, percent_val){
    // store all score values in an array
    scores_arr = []

    for (let i = 0; i < Object.keys(scores[direction]).length; i++) {
      sequence_id = Object.keys(scores[direction])[i]
      for (let j = 0; j < Object.keys(scores[direction][sequence_id]).length; j++){

        // push every single score value in this array
        primer_ids = Object.keys(scores[direction][sequence_id])
        scores_arr.unshift(scores[direction][sequence_id][primer_id[j]]);
      }
    }

    console.log(scores_arr.length);
}

function update_count_individual(direction, seq_id, percent_val){

}


function submit_primers(direction){
  // TODO
}
