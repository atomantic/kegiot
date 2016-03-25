/**
 * RFID module. This module was created to be used with a Sparkfun 13198 RFID scanner.
 * @module lib/rfid
 * @author Brandon Kite
 */
var _ = require('./_');
var common = require('./common');
var fs = require('fs');

var rfid = {};

module.exports = rfid;

if (process.env.MODE === 'desktop') {
  rfid.onRFID = function(callback) {
    // throw out a dummy rfid to test UI in desktop mode
    setTimeout(function() {
      callback(_.uuid());
    }, 5000);
  };
  rfid.onUserScan = function(userCallback, rfidCallback) {
    rfid.onRFID(rfidCallback);
  };
} else {

  // process.env.USBDEVICEID || /dev/ttyUSB0
  // /dev/serial/by-id/usb-FTDI_FT232R_USB_UART_AI02KO15-if00-port0
  var DEVICE_ID = '/dev/serial/by-id/usb-FTDI_FT232R_USB_UART_AI02KO15-if00-port0';

  rfid.onRFID = function(callback) {
    var readableStream = fs.createReadStream(DEVICE_ID);
    readableStream.on('data', function(data) {
      if (_.isFunction(callback)) {
        callback(data.toString('hex'));
      }
    });
    readableStream.on('close', function(data) {
      console.log('[INFO] RFID module: stream closed. Restarting...');
      common.command('forever restartall');
    });
    return {
      close: function() {
        readableStream.close();
      }
    };
  };

  rfid.onUserScan = function(userCallback, rfidCallback) {
    return rfid.onRFID(function(code) {
      if (code === '0a') {
        // ignore newline feed from rfid read
        return;
      }
      var user = common.db.users.find({
        code: code
      });
      console.log('onUserScan', user, code);
      if (user && _.isFunction(userCallback)) {
        userCallback(user);
      }
      if (!user && _.isFunction(rfidCallback)) {
        rfidCallback(code);
      }
    });
  };
}
