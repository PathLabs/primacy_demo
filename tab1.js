const submitButton = document.getElementById("submitButton")
var startRange = document.getElementById("startRange")
var endRange = document.getElementById("endRange")

var validate = require('./lib/input_validation.js')

const {ipcRenderer} = require('electron')

//sends "hello" to asynchronous-message channel
ipcRenderer.send('asynchronous-message', 'hello')

//Does event on reply
ipcRenderer.on('asynchronous-reply', (event, arg) =>{
  console.log(arg)
})

submitButton.addEventListener('click', function () {
try {
  if (validate.parseTemperature(startRange.value.toString())||
      validate.parseTemperature(endRange.value.toString())){
    console.log("test")
  } else {
    let python = spawn('python primacy.py', {'range-lower': startRange, 'range-upper': endRange}.toString());

    python.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
  }
} catch(e) {console.log(e)}
});
