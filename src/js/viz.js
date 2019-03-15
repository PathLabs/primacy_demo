const fs = require('fs');


var data =
    JSON.parse(
        fs.readFileSync(
            require('path').resolve(
                __dirname,
                'test_input.json'),
            'utf8'));



var sequence_id = Object.keys(data)[0]


var primer_ids = Object.keys(data[sequence_id].forward)
// console.log(data[sequence_id]['forward']['Sa_692846_245_18_F']['gc'])

var i;

var result_gc = []

for (i = 0; i< primer_ids.length; i++ ){
  primer_id = primer_ids[i]

  result_gc.push(data[sequence_id].forward[primer_id].gc)
}
