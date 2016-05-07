var auaFactory = require('../audioApiFuncs');

module.exports = (audioContext) => {
    var aua = auaFactory(audioContext);
    return {
        playNote: (freq, velocity) => {
            var oscs = [];
            [0, 2.4, 3.2].forEach((freqDeviation) => {
                oscs.push(aua.oscillator(freq + (1 + Math.random() / 2) * freqDeviation, 'triangle'));
            });

            var gain = velocity * 0.35;
            return aua.fadeOut(aua.gain(aua.loshelf(aua.mix.apply(aua, oscs), 1000, 4, 0.1), gain), 5);
        },
        stopNote: (note) => {
            var timeout = 400;
            aua.fadeOut(note, timeout / 1000);
            setTimeout(() => aua.stop(note), timeout);
        }
    }
};
