var common = require('./common');
var flowmeter = require('./flowmeter');
var lcd_msg = require('./lcd_msg');
var rateLimit = require('./rate_limit');
var valve = require('./valve');

module.exports = function(io){
  return function(user) {
    io.sockets.emit('userscan', user);
    console.log('rfid scanned', user);
    var amountRemaining = rateLimit.getVolumeRemaining(user);
    console.log('amountRemaining', amountRemaining);
    if (amountRemaining < 1) {
      return false;
    }
    // at least 1ml is allowed
    valve.openValve();
    console.log('valve open');
    // create flow counter
    var flowcounter = flowmeter();
    var changed = 0;
    var secondsIdle = 0;

    // per pour
    var pourLimit = common.db.configs.find({
      name: 'ml_per_pour'
    }).value;
    console.log('pourLimit', pourLimit);

    // assume no flow and shut off if the user doesn't flow for 10 seconds
    var checkFlow = setInterval(function() {
      var currentVolume = flowcounter.getVolume();
      console.log('volume check:', currentVolume, changed, secondsIdle);
      if (changed === currentVolume) {
        secondsIdle++;
      }
      changed = currentVolume;
      if (secondsIdle >= 10) {
        console.log('idle_timeout');
        flowcounter.stop();
        clearInterval(checkFlow);
        valve.closeValve();
        lcd_msg.showDeniedMsg('idle_timeout');
        // log it
        common.db.usage.push({
          id: _.uuid(),
          user: user.id,
          date: (new Date()).toLocaleDateString(),
          amount: changed
        });
        common.db.kegs.find({
          id: 'e3a78fda-b945-4256-af3f-f878d356901c'
        }).volume -= changed;
      }
    }, 1000);

    // watch the flow
    flowcounter.onVolumeChange(function(total) {
      console.log('volumechange', total, amountRemaining);
      var pourLimitReached = total >= pourLimit;
      var dailyLimitReached = total >= amountRemaining;
      if (pourLimitReached || dailyLimitReached) {
        console.log('volumechange:done', total, pourLimit, amountRemaining);
        // done!
        flowcounter.stop();
        clearInterval(checkFlow);
        valve.closeValve();
        // log it
        common.db.usage.push({
          id: _.uuid(),
          user: user.id,
          date: (new Date()).toLocaleDateString(),
          amount: total
        });
        // take that much out of the keg
        // TODO: handling for muliple kegs and handling/config of active keg?
        common.db.kegs.find({
          id: 'e3a78fda-b945-4256-af3f-f878d356901c'
        }).volume -= total;
      }
    });
  };
};
