const fs = require('fs');
const path = require('path')


// pipeline output after running module 1
var pipeline_mod_1_output = 'Sa_50_collection_out.json'

function get_paths(json_file_path){
  var collection_out = JSON.parse(fs.readFileSync(path.resolve('src/assets/test_targets', pipeline_mod_1_output ), 'UTF-8'));
  collection_out_sequence_ids = Object.keys(collection_out.sequences)
  json_paths = [];
  for (var i=0; i<collection_out_sequence_ids.length; i++){

    json_paths.push(collection_out.sequences[collection_out_sequence_ids[i]]['outfile']);
  }
  return json_paths
}


 function parse_json(direction, field){
   paths_array = get_paths(pipeline_mod_1_output);
   var xData = [];
   var yData = [];

   if (direction === 'forward'){  for (var i = 0; i < paths_array.length; i++){
       var data = JSON.parse(fs.readFileSync(path.resolve(paths_array[i]),'UTF-8'));

       for (var j = 0; j<Object.keys(data).length; j++){
         var sequence_id = Object.keys(data)[j]
         var values = [];
         xData.unshift(sequence_id)
         forward_primers = Object.keys(data[sequence_id].forward);
         for (var k = 0; k < forward_primers.length; k++){
           values.push(data[sequence_id].forward[forward_primers[k]][field]);
         }
         yData.unshift(values)
       }

     }}

     if (direction === 'reverse'){
       for (var i = 0; i < paths_array.length; i++){
         var data = JSON.parse(fs.readFileSync(path.resolve(paths_array[i]),'UTF-8'));

           for (var j = 0; j<Object.keys(data).length; j++){
             var sequence_id = Object.keys(data)[j]
             if (data[sequence_id].hasOwnProperty('reverse')){
               var values = [];
               xData.unshift(sequence_id)
               reverse_primers = Object.keys(data[sequence_id].reverse);
               for (var k = 0; k < forward_primers.length; k++){
                 values.push(data[sequence_id].reverse[reverse_primers[k]][field]);
               }
               yData.unshift(values)
             }
            else {
              continue;
            }
          }
       }}
    return [xData, yData]
}






function create_viz_spec(direction, field, div){
  data = parse_json(direction, field)
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
      boxpoints: 'outliers',
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
    title: field + " Box Plot Chart for " + direction + " primers",
    autosize: false,
    width: 1024,
    height: 600,
    yaxis: {
      autorange: true,
      showgrid: true,
      zeroline: true,
      // dtick: 5,
      gridcolor: "rgb(255, 255, 255)",
      gridwidth: 1,
      zerolinecolor: "rgb(255, 255, 255)",
      zerolinewidth: 2
    },
    margin: {
      l: 50,
      r: 50,
      b: 100,
      t: 100,
      pad: 4
    },
    paper_bgcolor: "rgb(243, 243, 243)",
    plot_bgcolor: "rgb(243, 243, 243)",
    showlegend: false
  };

  Plotly.newPlot(div, data, layout);

}

const module_1 = document.getElementById('module1');
module_1.addEventListener('click', function() {
    sendMessage('LOADMODULE', 1);
    console.log('attempting to load module 1');
});

const module_2 = document.getElementById('module2');
module_2.addEventListener('click', function() {
    sendMessage('LOADMODULE', 2);
    console.log('attempting to load module 2');
});
