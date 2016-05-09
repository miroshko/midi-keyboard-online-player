var {output, activity} = require('./output');
var synth = require('./synth');
var midiListener = require('./midiListener');

output('Starting');

midiListener.listen();
midiListener.on('noteOn', (note) => activity(true));
midiListener.on('noteOff', (note) => activity(false));

synth.init();
midiListener.on('noteOn', synth.on.bind(synth));
midiListener.on('noteOff', synth.off.bind(synth));

output('Synth initialized. Make sure the mute switch is off.');
