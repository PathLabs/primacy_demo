const fs = require('fs');
const path = require('path')



var pipeline_mod_1_output = 'Sa_50_collection_out.json'
// pipeline output after running module 1

function get_paths(json_file_path){
  var collection_out = JSON.parse(fs.readFileSync(path.resolve('src/assets/test_targets', pipeline_mod_1_output ), 'UTF-8'));
  // array stores all sequence names
  collection_out_sequence_ids = Object.keys(collection_out.sequences)
  json_paths = [];
  for (var i=0; i<collection_out_sequence_ids.length; i++){

    json_paths.push(collection_out.sequences[collection_out_sequence_ids[i]]['outfile']);
  }
  return json_paths
}


function parse_json(paths_array){
    var xData = []
    var yData = []
    for (var i = 0; i < paths_array.length; i++){
      var data = JSON.parse(fs.readFileSync(path.resolve(paths_array[i]),'UTF-8'));

      for (var j = 0; j<Object.keys(data).length; j++){
        var sequence_id = Object.keys(data)[j]
        var values = []
        xData.unshift(sequence_id)
        forward_primers = Object.keys(data[sequence_id].forward)
        for (var k = 0; k < forward_primers.length; k++){
          values.push(data[sequence_id].forward[forward_primers[k]].start)
        }
      }

    }

}

json_paths = get_paths(pipeline_mod_1_output)
parse_json(json_paths)





// var data =
//     JSON.parse(
//         fs.readFileSync(
//             require('path').resolve(
//                 __dirname,
//                 'test_input.json'),
//             'utf8'));
//
//
//
// var sequence_id = Object.keys(data)[0]
//
//
// var primer_ids = Object.keys(data[sequence_id].forward)
// // console.log(data[sequence_id]['forward']['Sa_692846_245_18_F']['gc'])
//
// var i;
//
// var result_gc = []
//
// for (i = 0; i< primer_ids.length; i++ ){
//   primer_id = primer_ids[i]
//
//   result_gc.push(data[sequence_id].forward[primer_id].gc)
// }
