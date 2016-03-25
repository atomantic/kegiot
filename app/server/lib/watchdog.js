/**
 * The watchdog is a configurable polling task that broadcasts notifications to slack when provided conditions are met.
 * Private Group: kegiot_alerts
 * @module lib/watchdog
 * @author Brandon Kite
 */
var https = require('https');
var common = require('./common');

/**
 * Creates a watchdog task that sends notifications to Slack when triggered
 * @param name The name of the watchdog
 * @param params
 * @param {monitorCallback} params.monitor
 * @param {Function} params.condition
 * @param {Number} params.pollPeriod
 * @param {Function | String} params.notification
 * @returns {{getStatus: Function, cancel: Function}}
 */
function watchdog(name, params) {
  var monitor = params.monitor || function(callback) {
    callback(null);
  };
  var pollPeriod = parseInt(params.pollPeriod || 60000);
  var options = {
    host: 'hooks.slack.com',
    port: 443,
    path: common.getConfig('slack_hook'),
    method: 'POST'
  };
  var lastBarked = null;
  var requestCallback = function(response) {
    var str = '';
    response.on('data', function(chunk) {
      str += chunk;
    });
    response.on('end', function() {
      //debug
      console.log(str);
    });
  };

  var timerID = setInterval(function() {
    monitor(function(message) {
      var payload = {};
      if (message) {
        lastBarked = Date.now();
        if (typeof message == 'string') {
          payload.text = message;
        } else {
          payload = message;
        }
        var req = https.request(options, requestCallback);
        req.write(JSON.stringify(payload));
        req.end();
      }
    });
  }, pollPeriod);

  console.log('Watchdog "' + name + '" configured.');
  return {
    getStatus: function getStatus() {
      return {
        lastBarked: lastBarked
      }
    },
    cancel: function cancel() {
      clearInterval(timerID);
    }
  };
}
//While calling watchdog.watchdog(..) may seem redundant, since watchdog is a function this approach
//is easier for stubbing and mocking watchdogs via the require cache.
module.exports.watchdog = watchdog;

/**
 * Usage Example
 *
 * watchdog('test', {
 *    monitor: function(callback) {
 *        var val = Math.random();
 *        console.log("monitoring", val);
 *        if (val > .5) {
 *            //send an alert
 *            callback('woof woof! ' + val);
 *        }
 *    },
 *    pollPeriod: 250
 * });
 */

/**
 * Performs a monitoring task. If the callback parameter is called a notification will be sent to slack with message it receives.
 * If the message is a string, it will post a simple text notification to slack.
 * If the message is an object it will be stringified as is and forwarded to slack. This allows monitors to customize the
 *  look and feel of their notifications.
 * @callback monitorCallback
 * @param {Function} callback(value) - Callback function to return the monitored value to the watchdog
 */
