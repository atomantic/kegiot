
var watchdog = require('./watchdog');
var common = require('./common');
var lcd = require('./lcd');
var lcd_msg = require('./lcd_msg');
// var temperature = require('./lib/temperature');

var isBeerMsg = true;

module.exports = function(){
  watchdog.watchdog('lcd msg', {
    monitor: function() {
      var msg = null;

      lcd.clear();

      if (isBeerMsg) {
        var kegs = common.db.kegs;
        var keg = kegs.first();
        var name = keg.name;
        var beer = keg.beer;

        isBeerMsg = false;
        msg = 'On tap ' + beer + " by " + name;

        // TODO Remove when temp is back online
        lcd.clear();
        lcd.print(msg, null);

      /*
           // TODO add back when temp sensor back online
           // and modularize
            temperature.readTemperature(function(temp) {
              lcd.row(0, function() {
                lcd.print(msg, null);
              });
              lcd.row(1, function() {
                lcd.print('Keg Temp ' + temp + 'F', null);
              });
            });
      */
      } else {
        isBeerMsg = true;

        lcd_msg.getDisplayMsg(function(dispMsg) {
          if (dispMsg.length > 1) {
            msg = dispMsg[0] + dispMsg[1];
          } else {
            msg = dispMsg[0];
          }
          lcd.clear();
          lcd.print(msg, null);
        });
      }
    },
    pollPeriod: 10000
  });
};
