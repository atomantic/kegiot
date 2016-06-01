/**
 *
 * Rate Limit Module
 * @module lib/rate_limit
 * @author CJ Barker
 */
var common = require('../lib/common');
var lcd_msg = require('../lib/lcd_msg');
var lcd = require('../lib/lcd');
var _ = require('../lib/_');

var rateLimit = {
  /**
   * Check configuration setting of when user is allowed to drink
   * within allocated timeframe.
   * @return True if attempting to pour drink given during blocked time frame
   */
  isTimeRateLimited: function() {
    console.log('rate_limit.isTimeRateLimited');
    var date = new Date();
    var hour = date.getHours();
    var configs = common.db.configs;

    var start_hour = configs.find({
      name: 'start_hour_allowed'
    }).value;

    var stop_hour = configs.find({
      name: 'stop_hour_allowed'
    }).value;

    if (hour >= stop_hour && hour < start_hour) {
      console.log("Rate limiting based on hour: " + hour);
      return true;
    } else {
      return false;
    }
  },

  isAccountExpired: function(user) {
    if (user === null) {
      return false;
    }

    // card expired as UTC timestamp
    var expiration = (new Date(user.expires)).getTime();
    var now = (new Date()).getTime();
    var diff = expiration - now;

    //console.log("Exp " + expiration);
    //console.log("Now " + now);
    //console.log("Diff is " + diff);

    return (diff < 0);
  },

  /**
   * Determines remaining liquid volume remaining for given
   * user.
   * @return mL remaining within
   */
  getVolumeRemaining: function(user) {
    if (user == null) {
      return 0;
    }

    // drink up admins :)
    if (user.roles.indexOf('admin')!==-1) {
      return 355;
    }

    if (rateLimit.isTimeRateLimited()) {
      lcd_msg.showDeniedMsg('off_hours');
      return 0;
    }

    if (rateLimit.isAccountExpired(user)) {
      lcd_msg.showDeniedMsg('expired');
      return 0;
    }

    var today = (new Date()).toLocaleDateString();
    var logQuery = {
      user: user.id,
      date: today
    };

    var usageLogs = common.db.usage.find(logQuery) || [];
    var useToday = 0;

    if (usageLogs.length > 1) {
      useToday = _.reduce(usageLogs, function(sum, log) {
        if (!_.isNumber(sum)) {
          sum = 0;
        }
        return sum + log.amount;
      });
    } else if (usageLogs.length == 1) {
      useToday = usageLogs[0].amount;
    } else {
      useToday = 0;
    }

    useToday = isNaN(useToday) ? 0 : useToday;

    console.log('useToday', useToday);
    var dailyLimit = common.db.configs.find({
      name: 'ml_per_day'
    }).value;
    console.log('dailyLimit', dailyLimit);

    var amountRemaining = dailyLimit - useToday;
    amountRemaining = amountRemaining.toFixed(2);

    console.log('amountRemaining', amountRemaining);
    if (amountRemaining < 1) {
      lcd_msg.showDeniedMsg('rate_limited');
      return 0;
    }

    lcd_msg.getInfoMsg('remaining_today', {
      'REMAINING': amountRemaining
    }, function(lcdMsg) {
      console.log(lcdMsg);
      lcd.clear();
      lcd.print(lcdMsg, null);
    });

    return amountRemaining;
  }
};
module.exports = rateLimit;
