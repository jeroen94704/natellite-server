var assert    = require("assert");
var Natellite = require('../lib/Natellite');

describe('Natellite', function() {
    var nat;

    beforeEach(function() {
        nat = new Natellite();
    });

    describe('.getApp()', function() {

        it('should create apps on-demand', function() {
            var app = nat.getApp(123);
            assert.ok(app);
        });

        it('should return the same app twice', function() {
            var a1 = nat.getApp(123);
            var a2 = nat.getApp(123);
            assert.ok(a1 == a2);
        });

    });

});
