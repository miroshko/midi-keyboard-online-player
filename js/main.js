var output = require('./output');
var synth = require('./synth');
var midiListener = require('./midiListener');

midiListener.listen();
midiListener.on('noteOn', (note) => output(`noteOn. pitch: ${note.pitch}; velocity: ${note.velocity}`))
midiListener.on('noteOff', (note) => output(`noteOff. pitch: ${note.pitch}; velocity: ${note.velocity}`))

synth.init();
midiListener.on('noteOn', (note) => synth.on(note));
midiListener.on('noteOff', (note) => synth.off(note));
