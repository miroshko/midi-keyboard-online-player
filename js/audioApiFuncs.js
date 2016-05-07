module.exports = (audioContext) => ({
    oscillator: (frequency, type) => {
        var oscillator = audioContext.createOscillator();
        var gain = audioContext.createGain();
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        gain.gain.value = 1;
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(0);
        return [gain, oscillator];
    },
    gain: (audioNodesArray, gainValue) => {
        var gain = audioNodesArray[0];
        gain.gain.value = gainValue;
        return audioNodesArray;
    },
    loshelf: (audioNodesArray, freq, q, gain) => {
        var filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = freq;
        filter.Q.value = q;
        filter.gain.value = gain;
        var gain = audioContext.createGain();
        gain.gain.value = 1;
        audioNodesArray[0].disconnect(audioContext.destination);
        audioNodesArray[0].connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);
        return [gain, filter].concat(audioNodesArray);
    },
    mix: function (gain) {
        var argsArray = Array.from(arguments);
        var gain = audioContext.createGain();
        gain.gain.value = 1;
        argsArray.forEach((audioNodesArray) => {
            audioNodesArray[0].disconnect(audioContext.destination);
            audioNodesArray[0].connect(gain);
        });
        gain.connect(audioContext.destination);
        return [gain, argsArray];
    },
    stop: (audioNodesArray, timeout) => {
        setTimeout(() => {
            audioNodesArray[0].disconnect(audioContext.destination);
        }, timeout);
        return audioNodesArray;
    },
    fadeOut: (audioNodesArray, timeout) => {
        timeout = timeout || 1;
        var gain = audioNodesArray[0];
        gain.gain.setValueAtTime(gain.gain.value, audioContext.currentTime);
        gain.gain.cancelScheduledValues(audioContext.currentTime);
        gain.gain.setTargetAtTime(0, audioContext.currentTime, timeout / 4);
        return audioNodesArray;
    }
});
