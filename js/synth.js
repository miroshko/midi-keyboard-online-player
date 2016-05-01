var audioCtx = new global.AudioContext();

module.exports = {
  init: function() {
    this._oscillators = {};
    this._output = audioCtx.createGain();
    this._output.gain.value = 0.6;
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
