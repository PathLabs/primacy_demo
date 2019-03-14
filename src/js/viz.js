var data =
    JSON.parse(
        require('fs').readFileSync(
            require('path').resolve(
                __dirname,
                'test_input.json'),
            'utf8'));


console.log(typeof(data))
var sequence_id = Object.keys(data)[0]
