var output = require('./output');
var Emitter = require('events').EventEmitter;

var listener = new Emitter();

function emitMidiEvent(event) {
  var eventType;
  if (event.data[0] >= 144 && event.data[0] <= 159) {
    eventType = 'noteOn';
  } else if (event.data[0] >= 128 && event.data[0] <= 143) {
    eventType = 'noteOff';
  }

  var pitch = event.data[1];
  var velocity = event.data[2];

  if (eventType == 'noteOn' && velocity == 0) {
    eventType = 'noteOff';
  }

  listener.emit(eventType, {pitch: pitch, velocity: velocity});
}

Object.assign(listener, {
  listen: function() {
    if (window.navigator.requestMIDIAccess) {
      window.navigator.requestMIDIAccess({sysex:false})
        .then((midiAccess) => {
          var midiInputs = midiAccess.inputs.values();
          var input = midiInputs.next();
          var inputs = [];
          do {
            inputs.push(input);
            input.value.onmidimessage = emitMidiEvent;
            input = midiInputs.next();
          } while(!input.done)
          output('Listening to MIDI messages from: ' + inputs.map((i) => i.value.name).join('; '));
        }, () => output('Failed to get access to the MIDI device'));
    } else {
      output('MIDI API is not available in the browser');
    }
  }
});

module.exports = listener;
