//(function() {
  
  var context = new (window.AudioContext || window.webkitAudioContext)();
  var destination = context.destination;
  var analyser = context.createAnalyser();
  var source, proc, buffer;
  
  var data;
  
  var playBtn   = document.getElementById('play'),
      stopBtn   = document.getElementById('stop'),
      fileInput = document.getElementById('fileInput'),
      player    = document.getElementById('player'),
      fileName  = document.getElementById('fileName'),
      dropArea  = document.getElementById('dropArea'),
      waveform  = document.getElementById('waveform');

  setWave();
      
  function loadFile(file) {
    var uploader = new FileReader();
    fileName.innerHTML = file.name;
    uploader.onload = function (e) {
      context.decodeAudioData(this.result, function(decodedArrayBuffer) {
        buffer = decodedArrayBuffer;
        playFile();
      }, function(e) {
        console.log("Error file upload");
      })
    }
    uploader.readAsArrayBuffer(file);
  }
  
  function playFile() {
    stopFile();
    source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(proc);
    analyser.connect(destination);
    proc.connect(destination);
    source.start(0);
    player.setAttribute('data-state', 'play');
  }
  
  function stopFile() {
  	if (player.getAttribute('data-state') == 'play') {
  		source.stop(0);
  		player.setAttribute('data-state', 'stop');
  	}
  }
  
  function setWave() {
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;
    proc = context.createScriptProcessor(2048, 1, 1);
    
    canvas = waveform.getContext('2d');
    
    proc.onaudioprocess = function() {
      data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      canvas.fillRect(0, 0, waveform.width, waveform.height);
      
      for (var i = 0, l = data.length; i < l; i++) {
        canvas.clearRect(i, -(waveform.height/255)*data[i], 1, waveform.height);
      }
    }
  }
  
  fileInput.addEventListener("change", function(e) {
    try { 
      loadFile(e.target.files[0]);
    } catch(e) {
      console.log("Error file upload");
    }
  })
  
  stopBtn.addEventListener("click", function() { stopFile() });
  playBtn.addEventListener("click", function() { playFile() });
  
  dropArea.addEventListener('dragenter', function(e){
      e.currentTarget.classList.add('drop');
  });
  
  dropArea.addEventListener('dragleave', function(e){
      e.currentTarget.classList.remove('drop');
  });
  
  dropArea.addEventListener('dragover', function(e){
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
  });
  
  dropArea.addEventListener('drop', function(e){
      e.preventDefault();
      e.stopPropagation();
      this.classList.remove('drop');

      try { 
        loadFile(e.dataTransfer.files[0]);
      } catch(e) {
        console.log("Error file upload");
      }
  });
  
  
  //})();