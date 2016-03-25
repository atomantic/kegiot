/**
 *
 * Network Module
 * @module lib/network
 * @author CJ Barker
 */
var common = require('../lib/common');
var os = require('os');
var ifaces = os.networkInterfaces();

/**
 * Get the IP address for a given network interface name and version
 * @param ifname    Network interface name to retrieve
 * @param version   IPv4 or IPv6 version to retrieve
 * @returns String of the IP address
 */
function getIPAddr(ifname, version) {
  console.log('network:getIP');
  console.log('IFname ' + ifname);
  console.log('Version ' + version);

  for (var devName in ifaces) {
    if (ifname !== devName) {
      continue;
    }

    var iface = ifaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === version && alias.addres !== '127.0.0.1' && !alias.internal) {
        console.log(alias.address);
        return alias.address;
      }
    }
  }
}

module.exports = {

  /**
   * Get the IPv4 address for network interface
   * @param ifname    Network interface name to retrieve
   * @returns String of the IPv4 address
   */
  getIPv4: function(ifname) {
    console.log('network:getIPv4');
    return getIPAddr(ifname, 'IPv4');
  },

  /**
   * Get the IPv6 address for network interface
   * @param ifname    Network interface name to retrieve
   * @returns String of the IPv6 address
   */
  getIPv6: function(ifname) {
    console.log('network:getIPv6');
    return getIPAddr(ifname, 'IPv6');
  },

  /**
   * Persists given network settings to low db (JSON data file network.json
   * @param ifname    Network interface name to retrieve
   * @param addr      IP Address to persist
   * @returns {iframe: String, address: String, timeset: Integer}
   */
  saveIP: function(iname, addr) {
    console.log('network.saveIP');
    var ts = new Date().getTime();
    common.db.network
      .chain()
      .first()
      .assign({
        ifname: iname,
        address: addr,
        timeset: ts
      })
      .value();
    return common.db.network.first()
  },

  /**
   * Denotes if new IP address exists compared to previously persisted
   * @param getIPFunc Function of getIPAddr to look up
   * @param ifname    Name of network interface to retrieve
   * @returns true if IP address has changed or false if still the same
   */
  isNewIP: function(getIPFunc, ifname) {
    console.log('network:isNewIP');
    var prev_net = common.db.network.first();
    var curr_addr = getIPFunc(ifname);
    console.log('Curr ' + curr_addr);
    console.log('Prev ' + prev_net.address);
    return curr_addr !== prev_net.address;
  }
};
