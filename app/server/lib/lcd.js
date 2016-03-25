/**
 * LCD Module
 * @module lib/lcd
 * @author Adam Eivy
 */
var common = require('./common');

function runCommand(command, cb) {
  if (process.env.MODE !== 'BBB') {
    console.log('command skipped (not BBB mode)');
    if (cb && typeof cb === "function") {
      return cb();
    } else {
      return false;
    }
  }
  common.command(command, __dirname, function(err, out) {
    // console.log('lcd: '+command, err, out);
    if (cb && typeof cb === "function") {
      cb();
    }
  });
}

function setRow(row, cb) {
  // console.log('lcd:setRow' + row);
  runCommand('i2cset -y 1 0x04 0x73 0x63 0x0' + row + ' 0x00 i', cb);
}

var lcd = {
  row: function(row, cb) {
    setRow(row, cb);
  },
  clear: function(cb) {
    // console.log('lcd:clear');
    runCommand('i2cset -y 1 0x04 0x63 0x40 0x00 0x00 i', cb);
  },
  home: function(cb) {
    // console.log('lcd:home');
    runCommand('i2cset -y 1 0x04 0x68 0x40 0x00 0x00 i', cb);
  },
  print: function(str, cb) {
    // console.log('lcd:print');
    var bytes1 = null;
    var bytes2 = null;

    // LCD only supports 32 bytes of display chars
    if (str.length > 32) {
      str = str.substring(0, 33);
    }

    // LCD truncates at 11 bytes per line & displays 16 bytes per line
    if (str.length > 11 && str.length <= 16) {
      bytes1 = common.stringToBytes(str.substring(0, 11));
      runCommand('i2cset -y 1 0x04 0x70 0x00 0x00 0x00' + bytes1 + ' i', null);
      bytes2 = common.stringToBytes(str.substring(11, str.length));
      runCommand('i2cset -y 1 0x04 0x70 0x00 0x00 0x00' + bytes2 + ' i', cb);
    } else if (str.length > 16) {
      // display on both rows
      bytes1 = common.stringToBytes(str.substring(0, 11));
      runCommand('i2cset -y 1 0x04 0x70 0x00 0x00 0x00' + bytes1 + ' i', null);
      bytes1 = common.stringToBytes(str.substring(11, 16));
      runCommand('i2cset -y 1 0x04 0x70 0x00 0x00 0x00' + bytes1 + ' i', null);

      setRow(1, null);
      if (str.length > 27) {
        bytes2 = common.stringToBytes(str.substring(16, 27));
        runCommand('i2cset -y 1 0x04 0x70 0x00 0x00 0x00' + bytes2 + ' i', null);
        var bytes3 = common.stringToBytes(str.substring(27, str.length));
        runCommand('i2cset -y 1 0x04 0x70 0x00 0x00 0x00' + bytes3 + ' i', null);
      } else {
        bytes2 = common.stringToBytes(str.substring(16, str.length));
        runCommand('i2cset -y 1 0x04 0x70 0x00 0x00 0x00' + bytes2 + ' i', null);
      }
    } else {
      // less than 12 chars to display
      bytes1 = common.stringToBytes(str);
      runCommand('i2cset -y 1 0x04 0x70 0x00 0x00 0x00' + bytes1 + ' i', cb);
    }
  }
};
module.exports = lcd;
