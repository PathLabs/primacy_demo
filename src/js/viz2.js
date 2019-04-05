const fs = require("fs");
const path = require("path");
const os = require("os");
const { ipcRenderer } = require("electron");

// temporary using the get_paths() function from viz.js will update once connected to pipeline

function get_paths(json_file_path) {
  var collection_out = JSON.parse(
    fs.readFileSync(
      path.resolve("src/assets/test_targets", json_file_path),
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

// Data in assets/test_targets is currently in post primer scoring state so can use those to visualize

function parse_rank_values(direction) {
  paths_array = get_paths("Sa_50_collection_out.json");
  var yValues = [];
  var dict_keys_values = {};

  if (direction === "forward") {
    for (var i = 0; i < paths_array.length; i++) {
      var json_data = JSON.parse(
        fs.readFileSync(path.resolve(paths_array[i]), "UTF-8")
      );
      for (var j = 0; j<Object.keys(json_data).length; j++){
      var sequence_id = Object.keys(json_data)[0];
      forward_primers = Object.keys(json_data[sequence_id].forward);
      for (var k = 0; k < forward_primers.length; k++) {
        yValues.push(json_data[sequence_id].forward[forward_primers[k]]["rank"]);
      }
      dict_keys_values[sequence_id] = yValues;
    }


  }
}

  if (direction === "reverse") {
    for (var i = 0; i < paths_array.length; i++) {
      var json_data = JSON.parse(
        fs.readFileSync(path.resolve(paths_array[i]), "UTF-8")
      );
    for (var j = 0; j<Object.keys(json_data).length; j++){
      var sequence_id = Object.keys(json_data)[j];
      console.log(sequence_id);
      if (json_data[sequence_id].hasOwnProperty("reverse")) {
        reverse_primers = Object.keys(json_data[sequence_id].reverse);

        for (var k = 0; k < reverse_primers.length; k++) {
          yValues.push(
            json_data[sequence_id].reverse[reverse_primers[k]]["rank"]
          );
        }
        dict_keys_values[sequence_id] = yValues;
      }

             else {
              continue;
            }

    }



    }
  }

  return dict_keys_values;
  }





function create_viz_spec(forward, reverse, iter) {

  var forward_key= Object.keys(forward)[iter];
  var reverse_key = forward_key;

  var xValuesFor = [];
  var xValuesRev = [];


  for (var i=0; i<Object.keys(forward).length; i++)
  {
    xValuesFor.unshift(forward_key);
  }

  for (var i=0; i<Object.keys(reverse).length; i++)
  {
    xValuesRev.unshift(reverse_key);
  }


  var json_data = [
    {
      type: "violin",
      x: xValuesFor,
      y: forward[forward_key],
      legendgroup: "Yes",
      scalegroup: "Yes",
      name: "Forward",
      side: "negative",
      box: {
        visible: true
      },
      line: {
        color: "blue",
        width: 2
      },
      meanline: {
        visible: true
      }
    },
    {
      type: "violin",
      x: xValuesRev,
      y: reverse[reverse_key],
      legendgroup: "No",
      scalegroup: "No",
      name: "Reverse",
      side: "positive",
      box: {
        visible: true
      },
      line: {
        color: "green",
        width: 2
      },
      meanline: {
        visible: true
      }
    }
  ];

  var layout = {
    title: "Split Violin Plot",
    yaxis: {
      zeroline: false,
    },
    autoresize: false,
    xaxis: {range:[-1,1]},
    width: 600,
    violingap: 0,
    violingroupgap: 0,
    violinmode: "overlay",

  };



  var divElement = document.createElement("Div");
  var br = document.createElement("br");
  divElement.id = "graph"+ iter.toString(10);
  document.getElementById("main").appendChild(divElement);
  document.getElementById("main").appendChild(br);


  Plotly.plot("graph"+ iter.toString(10), json_data, layout,{responsive: true} );
}
