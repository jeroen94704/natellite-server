var assert  = require("assert");
var App     = require('../lib/App');
var Client  = require('../lib/Client');
var sinon   = require('sinon');

describe('App', function() {
    var app;
    var fakeTime = 0;

    beforeEach(function() {
        fakeTime     = Date.parse('January 1, 2000 12:00');
        Client.clock = function() { return fakeTime; }

        app = new App(123);
    });

    describe('.getClient()', function() {
        it('returns a new client', function() {
            var client = app.getClient(123);
            assert.ok(client);
        });

        it('returns the same client twice', function() {
            var c1 = app.getClient(123);
            var c2 = app.getClient(123);
            assert.ok(c1 == c2);
        });
    });

    describe('.getClientForAction()', function() {
        it('should invoke justCameOnline if the client went offline', function() {
            var spy = sinon.spy(Client.prototype, 'justCameOnline');

            var former = app.getClientForAction(123, 'password');
            fakeTime = Date.parse('January 1, 2000 13:00');

            var latter = app.getClientForAction(123, 'password');
            assert.ok(former == latter, 'Objects unequal');

            assert.ok(spy.called, 'justCameOnline not called');
            Client.prototype.justCameOnline.restore();
        });
    });
});
