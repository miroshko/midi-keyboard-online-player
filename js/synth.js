var {output} = require('./output');
var pianoFactory = require('./instruments/piano');

var AudioContext;

if (global.AudioContext) {
  AudioContext = global.AudioContext;
} else if (global.webkitAudioContext) {
  AudioContext = global.webkitAudioContext;
} else {
  output('Audio API is not supported by the browser');
}

var audioCtx = new AudioContext;
var piano = pianoFactory(audioCtx);

module.exports = {
  init: function() {
    this._notesPlaying = {};
  },
  on: function(note) {
    if (this._notesPlaying[note.pitch]) {
      return;
    }
    var freq = Math.pow(2, (note.pitch - 20 - 49) / 12) * 440;
    var notePlaying = this._notesPlaying[note.pitch] = piano.playNote(freq, note.velocity / 127);
  },
  off: function(note) {
    var notePlaying = this._notesPlaying[note.pitch];
    if (!notePlaying) {
      return;
    }
    piano.stopNote(notePlaying);
    delete this._notesPlaying[note.pitch];
  }
};
