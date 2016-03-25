var assert = require("chai").assert;
var expect = require("chai").expect;
var rate_limit = require("../server/lib/rate_limit");
var common = require("../server/lib/common");

describe('Array', function() {
    describe('#isAccountExpired(user)', function () {
        it('should return true when user account expired', function () {
            assert.isFalse(rate_limit.isAccountExpired(null), 'Do not expire empty account');
            var user =  {name:"Bob the Builder", id:"BOB123", code:"123", roles:['member'], expires:'2015/08/01'};
            assert.isTrue(rate_limit.isAccountExpired(user), 'User should be rate limited with expired account');
            user.expires = (new Date()).getTime() + 30;
            assert.isFalse(rate_limit.isAccountExpired(user), 'User should not be rate limited with valid account');
        });
    }),
    describe('#getVolumeRemaining(user)', function () {
        it('should return zero or negative when user over drinks', function () {
            assert.isTrue(rate_limit.getVolumeRemaining(null) === 0, 'Zero ML for null user');
            var user =  {name:"Bob the Builder", id:"BOB123", code:"123", roles:['member'], expires:'2050/08/01'};
            assert.isTrue(rate_limit.getVolumeRemaining(user) > 0, 'Should have some remaining for old bob');

            // Save usage which should be over
            common.db.usage.push({
                user: user.id,
                date: (new Date()).toLocaleDateString(),
                amount: 8
            });

            assert.isTrue(rate_limit.getVolumeRemaining(user) > 0, 'Should have some remaining for old bob');

            common.db.usage.push({
                user: user.id,
                date: (new Date()).toLocaleDateString(),
                amount: 10000000
            });


            assert.isTrue(rate_limit.getVolumeRemaining(user) <= 0, 'Nothing should remain - drank too much');

            // Delete user
            common.db.usage.remove({user: user.id});
        });
    })
});
