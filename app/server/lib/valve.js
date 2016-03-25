/**
 *
 * @module lib/valve
 * @author Brandon Kite
 */
if (process.env.MODE === 'desktop') {
  module.exports = {
    openValve: function() {},
    closeValve: function() {}
  }
} else {
  var b = require('bonescript');

  var BLACK_PIN = "P8_17";
  var RED_PIN = "P8_15";
  var TRANSITION_TIME = 4000;

  b.pinMode(BLACK_PIN, b.OUTPUT);
  b.digitalWrite(BLACK_PIN, b.LOW);

  b.pinMode(RED_PIN, b.OUTPUT);
  b.digitalWrite(RED_PIN, b.LOW);

  function triggerValve(pin) {
    return function openValve(callback) {
      //reset any previous state
      b.digitalWrite(BLACK_PIN, b.LOW);
      b.digitalWrite(RED_PIN, b.LOW);
      //start valve transitioning
      b.digitalWrite(pin, b.HIGH);
      setTimeout(function() {
        b.digitalWrite(pin, b.LOW);
        if (callback) {
          callback();
        }
      }, TRANSITION_TIME);
    }
  }

  module.exports = {
    openValve: triggerValve(BLACK_PIN),
    closeValve: triggerValve(RED_PIN)
  }
}
