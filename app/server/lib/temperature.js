/**
 * Temperature module. This module was created to be used with a TMP36 temperature sensor.
 * The TMP36 needs to be wired to the beaglebone's 3.3V, GNDA_ADC, and AIn_1 (pin #40).
 * Wiring diagram: https://learn.adafruit.com/system/assets/assets/000/009/312/medium800/beaglebone_fritzing.png
 * @module lib/temperature
 * @author Brandon Kite
 */
if (process.env.MODE === 'desktop') {
  var _ = require('./_');
  module.exports.readTemperature = function(callback) {
    callback(_.random(37, 38)); // dummy data
  }
} else {
  var bs = require('bonescript');
  var SENSOR_PIN = 'P9_40';

  /**
   * Read the temperature sensor.
   * @param {requestCallback} cb - The callback that handles the response.
   */
  function readTemperature(callback) {
    //voltage range [0, 1.8]
    bs.analogRead(SENSOR_PIN, function(v_in) {
      var millivolts = v_in.value * 1800; // 1.8V reference = 1800 mV
      var temp_c = (millivolts - 500) / 10;
      var temp_f = (temp_c * 9 / 5) + 32;
      callback(temp_f);
    });
  }
  module.exports.readTemperature = readTemperature;
}
/**
 * The callback to handle the temperature reading
 * @callback requestCallback
 * @param {number} temperature - The temperature reading in fahrenheit.
 */

/**
 * Warning: The analog inputs of the BBB operate at 1.8V.
 * Since the TMP36 has a theoretical maximum output of 3.3V,
 * there is a potential for the BBB to be damaged if the voltage in millivolts exceeds 1.8V.
 * This will only happen on a TMP36 if the temperature exceeds 130 degrees C (266 degrees F).
 */
