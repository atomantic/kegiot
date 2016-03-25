/**
 *
 * Unit tests for the watchdog.
 * @author Brandon Kite
 */

var sinon = require('sinon'),
  https = require('https'),
  watchdog = require('../server/lib/watchdog'),
  chai = require('chai'),
  assert = chai.assert;

//fake https requests
var stubRequest;
//fake time
var clock;


describe('Watchdog', function() {
  beforeEach(function() {
    clock = sinon.useFakeTimers();
    //stub out https requests
    stubRequest = sinon.stub(https, 'request');
    stubRequest.returns({
      write: function() {},
      end: function() {}
    });
  });

  afterEach(function() {
    clock.restore();
    stubRequest.restore();
  });
  describe('cancel', function() {
    it('should be cancellable', function(done) {
      var counter = 0;
      var dog = watchdog.watchdog('test', {
        monitor: function(callback) {
          callback(counter++);
        },
        pollPeriod: 100
      });
      var endCount = 0;
      setTimeout(function() {
        dog.cancel();
        endCount = counter;
      }, 500);

      setTimeout(function() {
        assert.equal(endCount, counter,
          'Monitor executed ' + (counter - endCount) + ' times after being cancelled.');
        done();
      }, 1000);
      clock.tick(2000);
    });
  });
  describe('getStatus', function() {
    it('should know the last time a notification was sent', function(done) {
      var testBarkTime = null;
      var dog = watchdog.watchdog('test', {
        monitor: function(callback) {
          testBarkTime = Date.now();
          dog.cancel();
          callback("bark");
        },
        pollPeriod: 500
      });
      setTimeout(function() {
        assert.equal(testBarkTime, dog.getStatus().lastBarked);
        done();
      }, 1000);
      clock.tick(2000);
    });
    it('should only send a notification if a message is specified.', function(done) {
      var dog = watchdog.watchdog('test', {
        monitor: function(callback) {
          dog.cancel();
          callback(); //call without a message
        },
        pollPeriod: 500
      });
      setTimeout(function() {
        assert.equal(null, dog.getStatus().lastBarked);
        done();
      }, 1000);
      clock.tick(2000);
    });
  });
});
