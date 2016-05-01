var output = require('./output');
var midiListener = require('./midiListener');

midiListener.listen();
midiListener.on('noteOn', (note) => output(`noteOn. pitch: ${note.pitch}; velocity: ${note.velocity}`))
midiListener.on('noteOff', (note) => output(`noteOff. pitch: ${note.pitch}; velocity: ${note.velocity}`))
