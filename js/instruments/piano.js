var auaFactory = require('../audioApiFuncs');

module.exports = (audioContext) => {
    var aua = auaFactory(audioContext);
    return {
        playNote: (freq, velocity) => {
            var oscs = [];
            [0, 2.9, -4.2].forEach((freqDeviation) => {
                [0.9, 0.5, 0.6, 0.22].forEach((harmonicsLevel, harmonicsNumber) => {
                    oscs.push(aua.gain(aua.oscillator((freq + freqDeviation) * (1 + harmonicsNumber)), harmonicsLevel));
                });
            });

            var gain = velocity * 0.15;
            return aua.fadeOut(aua.gain(aua.mix.apply(aua, oscs), gain), 5);
        },
        stopNote: (note) => {
            var timeout = 400;
            aua.fadeOut(note, timeout / 1000);
            setTimeout(() => aua.stop(note), timeout);
        }
    }
};
