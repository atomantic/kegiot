/**
 *
 * Unit tests for the flowmeter module.
 * @author Brandon Kite
 */

var sinon = require('sinon'),
  proxyquire = require('proxyquire').noCallThru(),
  chai = require('chai'),
  assert = chai.assert;


var attachInterruptCallback;

var flowmeter = proxyquire('../server/lib/flowmeter', {
  'bonescript': {
    pinMode: function() {},
    attachInterrupt: function(a, b, c, callback) {
      attachInterruptCallback = callback;
    }
  }
});

//fake time
var clock;

describe('Flowmeter', function() {
  beforeEach(function() {
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    clock.restore();
  });
  it('Measures', function() {
    var FREQUENCY = 50;
    var TIME = 4000;
    var EXPECTED_VOLUME = FREQUENCY / 43 * (TIME / 60000);
    var volume = 0;

    var counter = flowmeter().onVolumeChange(function(vol) {
      volume = vol;
    });

    var tickInterval = setInterval(function() {
      attachInterruptCallback();
    }, 1 / (FREQUENCY / 1000));
    clock.tick(TIME);
    counter.stop();
    clearInterval(tickInterval);
    assert.closeTo(volume, EXPECTED_VOLUME, 0.001);
  });
  it('Stops measuring', function() {
    var FREQUENCY = 50;
    var TIME = 4000;
    var EXPECTED_VOLUME = FREQUENCY / 43 * (TIME / 60000);
    var volume = 0;

    var counter = flowmeter().onVolumeChange(function(vol) {
      volume = vol;
    });

    var tickInterval = setInterval(function() {
      attachInterruptCallback();
    }, 1 / (FREQUENCY / 1000));
    clock.tick(TIME);
    counter.stop();
    //volume shouldn't change anymore
    clock.tick(TIME);
    clearInterval(tickInterval);
    assert.closeTo(volume, EXPECTED_VOLUME, 0.001);
  });
});
