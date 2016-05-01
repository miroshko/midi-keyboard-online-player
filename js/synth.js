var output = require('./output');

var AudioContext;

if (global.AudioContext) {
  AudioContext = global.AudioContext;
} else if (global.webkitAudioContext) {
  AudioContext = global.webkitAudioContext;
} else {
  output('Audio API is not supported by the browser');
}

var audioCtx = new AudioContext;

module.exports = {
  init: function() {
    this._oscillators = {};
    this._output = audioCtx.createGain();
    this._output.gain.value = 0.3;
    this._output.connect(audioCtx.destination);
  },
  on: function(note) {
    if (this._oscillators[note.pitch]) {
      return;
    }
    var oscillator = this._oscillators[note.pitch] = audioCtx.createOscillator();
    oscillator.frequency.value = Math.pow(2, (note.pitch - 20 - 49) / 12) * 440;
    oscillator.connect(this._output);
    oscillator.start(0);
  },
  off: function(note) {
    var oscillator = this._oscillators[note.pitch];
    if (!oscillator) {
      return;
    }
    oscillator.stop(0);
    oscillator.disconnect(this._output);
    delete this._oscillators[note.pitch];
  }
};
