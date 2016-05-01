var output = require('./output');
var synth = require('./synth');
var midiListener = require('./midiListener');

output('Starting');

midiListener.listen();
midiListener.on('noteOn', function (note) { output('noteOn. pitch: ' + note.pitch + ' velocity: ' + note.velocity); });
midiListener.on('noteOff', function (note) { output('noteOff. pitch: ' + note.pitch + ' velocity: ' + note.velocity); });

output('MIDI initialized');

synth.init();
midiListener.on('noteOn', synth.on.bind(synth));
midiListener.on('noteOff', synth.off.bind(synth));

output('Synth initialized. Make sure the mute switch is off.');
