/**
 *
 * This flowmeter module is designed for a YF-S401 flow sensor.
 *
 * Flow is measured by the following equation: frequency (f) = (98 * Q) where Q is liters / minute
 *
 * To measure the total amount of liquid that has passed through the sensor,
 *  calculate the number of rising edge interrupts on a periodic interval (e.g. 1 second) to get the frequency (f)
 *  then V = f / 98 * t, where V is volume and t is the time period of that interval.
 *
 * @module lib/flowmeter
 * @author Brandon Kite
 */
var _ = require('./_');
var EventEmitter = require("events").EventEmitter;
var emitter = new EventEmitter();
var b;

try {
  b = require('bonescript');
} catch (e) {
  console.log('unable to load bonescript');
  b = {
    pinMode: function() {
      console.log('flowmeter - pinMode called but bonescript is missing');
    },
    attachInterrupt: function() {
      console.log('flowmeter - attachInterrupt called but bonescript is missing');
    }
  };
}

var inputPin = 'P8_26';
b.pinMode(inputPin, b.INPUT);
b.attachInterrupt(inputPin, true, b.RISING, emitTick);

function emitTick() {
  emitter.emit('flow_tick', 1);
}

function createCounter() {
  //How often the tick frequency is computed
  var FREQUENCY_POLL_INTERVAL_MS = 500;
  //The constant to convert frequency into flow rate given by the specs
  var VOLUME_CONSTANT = 98;
  //Conversion ratio of liters to milliliters
  var LITERS_TO_MILLILITERS = 1000;
  //Responds to tick events
  var tickListener;
  //External listener for volume change events
  var externalCallback;
  //Measure exact time since last frequency poll interval
  var lastPollTime;
  //accumulates ticks from the flow sensor until the next frequency poll interval, then it's reset back to 0.
  var ticks = 0;
  //Reference to the interval timer function.
  var frequencyPoller;
  //The total volume measured since the counter started.
  var totalVolume = 0;

  tickListener = function() {
    ticks++;
  };
  emitter.on('flow_tick', tickListener);

  frequencyPoller = setInterval(function() {
    var tDeltaMs = Date.now() - lastPollTime;
    var tDeltaSeconds = tDeltaMs / 1000;
    var tDeltaMinutes = tDeltaMs / 60000;
    var frequency = ticks / tDeltaSeconds;
    var volume = frequency / VOLUME_CONSTANT * tDeltaMinutes * LITERS_TO_MILLILITERS;
    var oldTotalVolume = totalVolume;
    ticks = 0;
    if (!_.isNaN(volume)) {
      totalVolume += volume;
    }
    lastPollTime = Date.now();
    if (_.isFunction(externalCallback) && totalVolume != oldTotalVolume) {
      externalCallback(totalVolume);
    }
  }, FREQUENCY_POLL_INTERVAL_MS);
  lastPollTime = Date.now();
  var self = {
    getVolume: function() {
      return totalVolume;
    },
    onVolumeChange: function volumeChange(callback) {
      externalCallback = callback;
      return self;
    },
    stop: function() {
      clearInterval(frequencyPoller);
      externalCallback = null;
      emitter.removeListener('flow_tick', tickListener);
      return self;
    }
  };
  return self;
}

module.exports = createCounter;
