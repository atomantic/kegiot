var watchdog = require('./lib/watchdog');
var common = require('./lib/common');

module.exports = function() {
// only send an alert once per app restart
  var kegVolMsgSent = false;
  watchdog.watchdog('keg volume', {
    monitor: function(callback) {
      var keg_volume = common.db.kegs.first().volume;

      var consumed_volume = common.db.usage.sum(function(obj) {
        return obj.amount;
      });

      var ml_remain = keg_volume - consumed_volume;
      var perc_remain = (ml_remain / keg_volume) * 100;
      perc_remain = perc_remain.toFixed(2);

      // Make percent remaining configurable or leave at 20%?
      if (kegVolMsgSent === false && perc_remain <= 20) {
        kegVolMsgSent = true;
        callback("Keg volume is running low. Change out soon. Current volume remaing " + ml_remain + " ml, " + perc_remain + "% of keg");
      }
    },
    pollPeriod: 60000
  });
};
