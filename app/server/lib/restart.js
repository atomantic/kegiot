/**
 * USB maintenance module
 * @module lib/restart
 * @author Adam Eivy
 */

module.exports = {
  now: function() {
    var message = 'Going for app restart!';
    throw new Error(message);
  }
};
