// watch for USB changing address
var usbPath = process.env.USBPATH;
var watchdog = require('./watchdog');
var common = require('./common');

module.exports = process.env.MODE !== 'BBB' ? function(){} : function(){
  watchdog.watchdog('usb connectivity', {
    monitor: function(callback) {
      common.command("lsusb | grep -i 'Future Technology Devices' | cut -d' ' -f 2,4 | cut -d':' -f 1", __dirname, function(err, data) {
        if (err) {
          console.log('failed to fetch usb status', err);
          return;
        }
        data = data.replace(' ', '/');
        if (!usbPath) {
          usbPath = data;
          console.log("usb path set to " + usbPath);
        } else {
          if (data !== usbPath) {
            console.warn('usb path changed to', data, 'restarting BBB');
            callback('usb path changed, rebooting...');
            common.command('reboot -f');
          }
        }
      });
    },
    pollPeriod: 60000
  });
};
