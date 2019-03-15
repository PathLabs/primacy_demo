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
               forward_primers = Object.keys(data[sequence_id].forward);
               for (var k = 0; k < forward_primers.length; k++){
                 values.push(data[sequence_id].forward[forward_primers[k]].tm);
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
