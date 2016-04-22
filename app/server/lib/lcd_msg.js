/**
 *
 * LCD Messages Module
 * @module lib/lcd_msg
 * @author CJ Barker
 */
var temperature = require('./temperature');
var messages = require('../data/lcd_messages');
var _ = require('./_');
var lcd = require('./lcd');

module.exports = {
  getHourGreeting: function() {
    var date = new Date();
    var hour = date.getHours();
    var greeting = '';

    if (hour >= 17 || hour <= 3) {
      greeting = 'evening';
    } else if (hour < 12 || hour > 3) {
      greeting = 'morning';
    } else {
      greeting = 'afternoon';
    }

    return greeting;
  },
  /**
   * Display message when system is idle.
   * Array of strings to iterate thru for display: welcome msg, time, and temp.
   * @param {requestCallback} cb = The callback that handles response of
   * array of strings ["msg1", "msg2", "msg3"]
   */
  getDisplayMsg: function(callback) {
    console.log('lcd_msg.getDisplayMsg');
    var date = new Date();
    var i = _.random(0, messages.greetings.length - 1);
    var msg = [];

    temperature.readTemperature(function(temp) {
      msg.push(messages.greetings[i] + "! ");
      msg.push(date.toLocaleString());

      if (callback && typeof (callback) === "function") {
        console.log(msg, temp);
        callback(msg);
      }
    });
  },

  /**
   * Generate appropriate access denied message.
   * @param msgKey key to load: unauthorized, rate_limited, or off_hours
   */
  showDeniedMsg: function(msgKey) {
    console.log('lcd_msg.showDeniedMsg:' + msgKey);
    lcd.clear();
    lcd.print(messages.denied[msgKey], null);
  },

  /**
   * Generate appropriate info message.
   * @param msgType MsgType to load: unauthorized, rate_limited, or off_hours
   * @param replacements an object of replacement strings
   * @param {callback} The callback that handles response string
   */
  getInfoMsg: function(msgType, replacements, callback) {
    console.log('lcd_msg.getInfoMsg', msgType, replacements);
    var message = '';
    if (msgType && msgType.trim()) {
      message = messages.info[msgType];
      if (message) {
        _.each(replacements, function(val, key) {
          console.log('replace', key, val);
          message = message.replace(key, val);
        });
      }
    }

    if (callback && typeof (callback) === "function") {
      console.log(message);
      callback(message);
    }
  },
  /**
   * Generate random message when user granted access.
   * @param {callback} The callback that handles response of array of strings ['msg1', 'msg2']
   */
  getAccessMsg: function(callback) {
    console.log('lcd_msg.getAccessMsg');
    var msg = [];
    var i = _.random(0, messages.authorized.length - 1);

    msg.push(messages.authorized[i]);

    if (callback && typeof (callback) === "function") {
      console.log(msg);
      callback(msg);
    }
  }
};
