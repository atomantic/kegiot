var assert = require("chai").assert;
var lcd_msg = require("../server/lib/lcd_msg.js");

describe('Array', function() {
    describe('#getDisplayMsg(callback)', function () {
        it('should return greeting message', function () {
            lcd_msg.getDisplayMsg(function(msg) {
                assert.isNotNull(msg, "Greeting message should exists");
            });
        });
    }),
    describe('#getAccessMsg(callback)', function () {
        it('should return denied message', function() {
            lcd_msg.getAccessMsg(function(msg) {
                assert.isTrue(msg.length > 0);
            });
        });
    });
});
