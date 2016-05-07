(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = function (audioContext) {
    return {
        oscillator: function oscillator(frequency, type) {
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
        gain: function gain(audioNodesArray, gainValue) {
            var gain = audioNodesArray[0];
            gain.gain.value = gainValue;
            return audioNodesArray;
        },
        loshelf: function loshelf(audioNodesArray, freq, q, gain) {
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
        mix: function mix(gain) {
            var argsArray = Array.from(arguments);
            var gain = audioContext.createGain();
            gain.gain.value = 1;
            argsArray.forEach(function (audioNodesArray) {
                audioNodesArray[0].disconnect(audioContext.destination);
                audioNodesArray[0].connect(gain);
            });
            gain.connect(audioContext.destination);
            return [gain, argsArray];
        },
        stop: function stop(audioNodesArray, timeout) {
            setTimeout(function () {
                audioNodesArray[0].disconnect(audioContext.destination);
            }, timeout);
            return audioNodesArray;
        },
        fadeOut: function fadeOut(audioNodesArray, timeout) {
            timeout = timeout || 1;
            var gain = audioNodesArray[0];
            gain.gain.setValueAtTime(gain.gain.value, audioContext.currentTime);
            gain.gain.cancelScheduledValues(audioContext.currentTime);
            gain.gain.setTargetAtTime(0, audioContext.currentTime, timeout / 4);
            return audioNodesArray;
        }
    };
};

},{}],2:[function(require,module,exports){
'use strict';

var auaFactory = require('../audioApiFuncs');

module.exports = function (audioContext) {
    var aua = auaFactory(audioContext);
    return {
        playNote: function playNote(freq, velocity) {
            var oscs = [];
            [0, 2.4, 3.2].forEach(function (freqDeviation) {
                oscs.push(aua.oscillator(freq + (1 + Math.random() / 2) * freqDeviation, 'triangle'));
            });

            var gain = velocity * 0.35;
            return aua.fadeOut(aua.gain(aua.loshelf(aua.mix.apply(aua, oscs), 1000, 4, 0.1), gain), 5);
        },
        stopNote: function stopNote(note) {
            var timeout = 400;
            aua.fadeOut(note, timeout / 1000);
            setTimeout(function () {
                return aua.stop(note);
            }, timeout);
        }
    };
};

},{"../audioApiFuncs":1}],3:[function(require,module,exports){
'use strict';

var output = require('./output');
var synth = require('./synth');
var midiListener = require('./midiListener');

output('Starting');

midiListener.listen();
midiListener.on('noteOn', function (note) {
  return output('noteOn. pitch: ' + note.pitch + ' velocity: ' + note.velocity);
});
midiListener.on('noteOff', function (note) {
  return output('noteOff. pitch: ' + note.pitch + ' velocity: ' + note.velocity);
});

synth.init();
midiListener.on('noteOn', synth.on.bind(synth));
midiListener.on('noteOff', synth.off.bind(synth));

output('Synth initialized. Make sure the mute switch is off.');

},{"./midiListener":4,"./output":5,"./synth":6}],4:[function(require,module,exports){
'use strict';

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

  listener.emit(eventType, { pitch: pitch, velocity: velocity });
}

Object.assign(listener, {
  listen: function listen() {
    if (window.navigator.requestMIDIAccess) {
      window.navigator.requestMIDIAccess({ sysex: false }).then(function (midiAccess) {
        var midiInputs = midiAccess.inputs.values();
        var input = midiInputs.next();
        var inputs = [];
        do {
          inputs.push(input);
          input.value.onmidimessage = emitMidiEvent;
          input = midiInputs.next();
        } while (!input.done);
        output('Listening to MIDI messages from: ' + inputs.map(function (i) {
          return i.value.name;
        }).join('; '));
      }, function () {
        return output('Failed to get access to the MIDI device');
      });
    } else {
      output('MIDI API is not available in the browser');
    }
  }
});

module.exports = listener;

},{"./output":5,"events":7}],5:[function(require,module,exports){
(function (global){
'use strict';

var outContainer = global.document.querySelector('#output');

function output(msg) {
  outContainer.innerHTML += msg + '\n';
  global.window.scrollTo(0, document.body.scrollHeight);
}

module.exports = output;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
'use strict';

var output = require('./output');
var pianoFactory = require('./instruments/piano');

var AudioContext;

if (global.AudioContext) {
  AudioContext = global.AudioContext;
} else if (global.webkitAudioContext) {
  AudioContext = global.webkitAudioContext;
} else {
  output('Audio API is not supported by the browser');
}

var audioCtx = new AudioContext();
var piano = pianoFactory(audioCtx);

module.exports = {
  init: function init() {
    this._notesPlaying = {};
  },
  on: function on(note) {
    if (this._notesPlaying[note.pitch]) {
      return;
    }
    var freq = Math.pow(2, (note.pitch - 20 - 49) / 12) * 440;
    var notePlaying = this._notesPlaying[note.pitch] = piano.playNote(freq, note.velocity / 127);
  },
  off: function off(note) {
    var notePlaying = this._notesPlaying[note.pitch];
    if (!notePlaying) {
      return;
    }
    piano.stopNote(notePlaying);
    delete this._notesPlaying[note.pitch];
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./instruments/piano":2,"./output":5}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[3]);
