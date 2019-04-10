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
  var xValues = [];
  var yValues = [];

  if (direction === "forward") {
    for (var i = 0; i < paths_array.length; i++) {
      var json_data = JSON.parse(
        fs.readFileSync(path.resolve(paths_array[i]), "UTF-8")
      );

      sequence_id = Object.keys(json_data)[0];
      forward_primers = Object.keys(json_data[sequence_id].forward);

      for (var k = 0; k < forward_primers.length; k++) {
              xValues.push(sequence_id);
              yValues.push(
                json_data[sequence_id].forward[forward_primers[k]]["score"]
              );
            }

  }

}

if (direction == "reverse"){
  for (var i = 0; i < paths_array.length; i++) {
    var json_data = JSON.parse(
      fs.readFileSync(path.resolve(paths_array[i]), "UTF-8")
    );

    sequence_id = Object.keys(json_data)[0];

        if (json_data[sequence_id].hasOwnProperty("reverse")) {
          reverse_primers = Object.keys(json_data[sequence_id].reverse);
          for (var k = 0; k < reverse_primers.length; k++) {
                  xValues.push(sequence_id);
                  yValues.push(
                    json_data[sequence_id].reverse[reverse_primers[k]]["score"]
                  );
                }

        }

        else {
          continue
        }


}


}
return [xValues, yValues];
}


function create_viz_spec(direction){

  var data = [{
  type: 'violin',
  x: parse_rank_values(direction)[0],
  y: parse_rank_values(direction)[1],
  points: 'none',
  box: {
    visible: true
  },
  line: {
    color: 'cls',
  },
  meanline: {
    visible: true
  },
  transforms: [{
  	 type: 'groupby',
	 groups: parse_rank_values(direction)[0]
	}]
}]

var layout = {
  title: "Violin Plot " + direction + " Primer Ranks",
  yaxis: {
    zeroline: false
  },
	showlegend: false
}

Plotly.plot(direction, data, layout);

}


function update_forward_count(){

}

function update_reverse_count(){

}
