var watchdog = require('./watchdog');
var common = require('./common');
var network = require('./network');

module.exports = function(){
  watchdog.watchdog('networkIP', {
    monitor: function(callback) {
      var configs = common.db.configs;
      var iface = configs.find({
        name: 'iface'
      }).value;

      if (iface === null || iface === undefined) {
        console.log('Malformed or missing iface configuration setting.');
        return;
      }

      var ip = network.getIPv4(iface);
      if (ip === null || ip === undefined) {
        console.log('Unable to find IP address for network IFACE: ' + iface);
        return;
      }

      if (network.isNewIP(network.getIPv4, iface)) {
        console.log("New IP [" + ip + "] for IFACE " + iface);
        network.saveIP(iface, ip);
        callback("Kegiot is running at http://" + ip + ":" + (process.env.PORT || 1337));
      }
    },
    pollPeriod: 10000
  });

};
