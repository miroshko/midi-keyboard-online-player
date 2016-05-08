var auaFactory = require('../audioApiFuncs');

module.exports = (audioContext) => {
    var aua = auaFactory(audioContext);
    return {
        playNote: (freq, velocity) => {
            var oscs = [];

            var steps = 7;
            var imag = new global.Float32Array(steps);
            var real = new global.Float32Array(steps);

            for (var i = 1; i < steps; i++) {
                imag[i] = 1 / (i * Math.PI);
            }
            var wave = audioContext.createPeriodicWave(real, imag);

            [-1.9, 1.1, 0].forEach((deviation) => {
                oscs.push(aua.oscillator(freq + deviation, wave))
            });

            var note = aua.fadeOut(aua.gain(aua.mix.apply(null, oscs), 0.4 * velocity), 5);
            return note;
        },
        stopNote: (note) => {
            var timeout = 400;
            aua.fadeOut(note, timeout / 1000);
            setTimeout(() => aua.stop(note), timeout);
        }
    }
};
