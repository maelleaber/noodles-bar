import config from './config.js'

const canvas = document.createElement('canvas')
canvas.width = 800
canvas.height = 500
const ctx = canvas.getContext('2d')

let isPlaying = true
let maxHeight = 400
let isEaten = 0
let startTime
let time
let time_s
let time_min

function loop() {

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, 800, 500)
  ctx.lineCap = "round"
  
  
  let height = maxHeight - isEaten
  let width = 15
  const noodle1 = new Path2D()
  noodle1.rect(350, 0, width, height)
  ctx.fillStyle = '#e1e3ac'
  ctx.fill(noodle1)

  const noodle2 = new Path2D()
  noodle2.rect(380, 0, width, height)
  ctx.fillStyle = '#e1e3ac'
  ctx.fill(noodle2)

  const noodle3 = new Path2D()
  noodle3.rect(410, 0, width, height)
  ctx.fillStyle = '#e1e3ac'
  ctx.fill(noodle3)

  const noodle4 = new Path2D()
  noodle4.rect(440, 0, width, height)
  ctx.fillStyle = '#e1e3ac'
  ctx.fill(noodle4)
  
  const rectangle = new Path2D
  rectangle.rect(300, 400, 200, 100)
  ctx.fillStyle = 'black'
  ctx.fill(rectangle)

  const table = new Path2D
  table.rect(200, 480, 400, 25)
  ctx.fillStyle = '#631c00'
  ctx.fill(table)
  

  const bowl = new Path2D()
  bowl.arc(400, 390, 100, 0, Math.PI)
  ctx.stroke(bowl)

  ctx.moveTo(300, 390)
  ctx.lineTo(500, 390)
  ctx.stroke()

  ctx.fillStyle = "#f58473"
  ctx.fill(bowl)

  if (height < 0) {
    height = 0
  }

  if (height == 0) {
    let date2 = new Date
    let endtime = date2.getTime()
    time = endtime - startTime
    time_s = Math.floor(((time) / 1000) % 60)
    time_min = Math.floor(((time) / (1000 * 60)) % 60)
    time_min = (time_min < 10) ? "0" + time_min : time_min;
    time_s = (time_s < 10) ? "0" + time_s : time_s;
    console.log('time: ' + time_min + ':' + time_s)

    document.getElementById("game_score").textContent = 'Congrats! You ate everything in ' + time_min + 'm' + time_s + 's. Reload the page to try again'
  
    const prettyTime = time_min + ':' + time_s
    isPlaying = false
    sendScore(prettyTime);

   
  }

  if(isPlaying == true){
    window.requestAnimationFrame(loop)
  }
}



function sound() {

  var Recording = function (cb) {
    var recorder = null;
    var recording = true;
    var audioInput = null;
    var volume = null;
    var audioContext = null;
    var callback = cb;
  
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia || navigator.msGetUserMedia;
  
    if (navigator.getUserMedia) {
      navigator.getUserMedia({
          audio: true
        },
        function (e) { //success
          var AudioContext = window.AudioContext || window.webkitAudioContext;
          audioContext = new AudioContext();
          volume = audioContext.createGain(); // creates a gain node
          audioInput = audioContext.createMediaStreamSource(e); // creates an audio node from the mic stream
          audioInput.connect(volume); // connect the stream to the gain node
          recorder = audioContext.createScriptProcessor(2048, 1, 1);
  
          recorder.onaudioprocess = function (e) {
            if (!recording) return;
            var left = e.inputBuffer.getChannelData(0);
            callback(new Float32Array(left));
          };
          volume.connect(recorder); // connect the recorder
          recorder.connect(audioContext.destination);
        },
        function (e) { //failure
          alert('Error capturing audio.');
        }
      );
    } else {
      alert('getUserMedia not supported in this browser.');
    }
  };
  
  var lastClap = (new Date()).getTime();
  
  function detectClap(data) {
    var t = (new Date()).getTime();
    if (t - lastClap < 200) return false;
    var zeroCrossings = 0,
      highAmp = 0;
    for (var i = 1; i < data.length; i++) {
      if (Math.abs(data[i]) > 0.25) highAmp++;
      if (data[i] > 0 && data[i - 1] < 0 || data[i] < 0 && data[i - 1] > 0) zeroCrossings++;
    }
  
    if (highAmp > 20 && zeroCrossings > 30) {
      lastClap = t;
      return true;
    }
    return false;
  }

  Recording(function (data) {
    if (detectClap(data)) {
      console.log('clap!');
      isEaten += 10
    }
  })
  
}


function sendScore(score) {
  fetch('http://localhost:3001/experiment/score', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({title: score})
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app')
  const btn = document.getElementById('button')
  app.append(canvas)
  
  btn.disabled = false
  btn.addEventListener('click', () => {

    sound()
    var date1 = new Date
    startTime = date1.getTime()
    console.log('start time' + startTime)
    btn.disabled = true
  
  })
  
  loop()
  

})
