var assert = require("chai").assert;
var expect = require("chai").expect;
var network = require("../server/lib/network.js");

describe('Array', function() {
    describe('#getIPv4_and_getIPv6()', function () {
        it('should return IP when valid interface used', function () {
            var ip = network.getIPv4('en0');
            expect(ip.length).to.be.within(7, 15);
            ip = network.getIPv6('en0');
            expect(ip.length).to.be.within(25, 39);
        });
        it('should not return IP when invalid interface used', function () {
            var ip = network.getIPv4('foasd');
            assert(ip === undefined, 'No IPv4 should exists for invalid IFACE');
            ip = network.getIPv6('afoasd');
            assert(ip === undefined, 'No IPv4 should exists for invalid IFACE');
        });
    }),
    describe('#isNewIP()_and_saveIP', function () {
        it('should return epoch timestamp when IP was written to JSON data', function () {
            network.saveIP('en0', network.getIPv4('en0'));
            assert( !network.isNewIP(network.getIPv4, 'en0'), "IP should be the same");
            network.saveIP('lo0', '127.0.0.1');
            assert( network.isNewIP(network.getIPv4, 'en0'), "IP should not be the same");
        });
    });
});
