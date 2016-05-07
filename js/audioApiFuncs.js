module.exports = (audioContext) => ({
    oscillator: (frequency) => {
        var oscillator = audioContext.createOscillator();
        var gain = audioContext.createGain();
        oscillator.frequency.value = frequency;
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
