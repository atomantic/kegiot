var watchdog = require('./watchdog');
var common = require('./common');
var temperature = require('./temperature');

module.exports = function(){
  watchdog.watchdog('temperature', {
    monitor: function(callback) {
      var configs = common.db.configs;
      var min_temp = configs.find({
        name: 'min_temp'
      }).value;
      var max_temp = configs.find({
        name: 'max_temp'
      }).value;

      if (min_temp === null || min_temp === undefined
        || max_temp === null || max_temp === undefined) {
        console.log("Unable to get min and max temperature thresholds.");
        return;
      }

      temperature.readTemperature(function(temp) {
        if (temp < min_temp || temp > max_temp) {
          console.log("Temp threshold hit at " + temp + "F");
          callback("Kegiot temperature hit threshold of " + temp + "F");
        }
      });
    },
    pollPeriod: 60000
  });
}
