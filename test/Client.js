var assert = require("assert");
var Client = require('../lib/Client');


describe('Client', function() {
    var client;
    var fakeTime = 0;

    beforeEach(function() {
        fakeTime = Date.parse('January 1, 2000 12:00');
        Client.clock = function() { return fakeTime; }
        client = new Client(123);
    });

    describe('.isOnline()', function() {
        it('should return true immediately after creation', function() {
            assert.equal(true, client.isOnline());
        });

        it('should return true after some slack time', function() {
            fakeTime = Date.parse('January 1, 2000 12:02');
            assert.equal(true, client.isOnline());
        })

        it('should return false after a while', function() {
            fakeTime = Date.parse('January 1, 2000 12:10');
            assert.equal(false, client.isOnline());
        })
    })

    describe('.authenticate()', function() {
        it("always succeeds on a new client", function() {
            client.authenticate('abc');
        });

        it("succeeds twice in a row", function() {
            client.authenticate('abc');
            client.authenticate('abc');
        });

        it("fails if passwords don't match", function() {
            assert.throws(function() {
                client.authenticate('abc');
                client.authenticate('def');
            });
        });
    });

    describe('.dequeue', function() {
        it('receives enqueued messages', function(done) {
            client.enqueue('message');
            client.dequeue().then(function(m) {
                assert.equal('message', m);
                done();
            });
        });

        it('can be dequeued before enqueuing', function(done) {
            client.dequeue().then(function(m) {
                assert.equal('message', m);
                done();
            });
            client.enqueue('message');
        });
    });

    it('should clear local IPs after being offline', function() {
        client.setLocalIPs([1, 2, 3]);
        client.justCameOnline();
        assert.deepEqual([], client.localIPs);
    });
});
