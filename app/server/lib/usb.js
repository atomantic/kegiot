/**
 * USB maintenance module
 * @module lib/usb
 * @author Adam Eivy
 */
var common = require('./common');

var usb = {
  reset: function(callback) {
    callback(null, 'ok');
  }
};

module.exports = usb;

if (process.env.MODE === 'BBB') {
  usb.reset = function(callback) {
    console.log('USB Reset!!!');
    common.command('/opt/kegiot/bin/kickusb.sh', '/opt/kegiot/bin', callback);
  // common.command(
  //   "lsusb | grep -i 'Future Technology Devices' | cut -d' ' -f 2,4 | cut -d':' -f 1 | sed 's/ /\//'",
  //   __dirname,
  //   function(err, data) {
  //     common.command('/opt/kegiot/bin/usbreset /dev/bus/usb/' + data, __dirname, callback);
  //   }
  // );
  }
}
