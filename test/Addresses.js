var assert = require("assert");
var Addresses = require('../lib/Addresses');

describe('Addresses', function() {
    var a = new Addresses();
    a.setRemote('88.99.100.200');
    a.setLocal('10.0.0.1, 127.0.0.1, 192.168.0.1');

    describe('.findCommon', function() {
        it('should return a local IP address for shared remote', function() {
            // And ignore the loopback address
            var b = new Addresses();
            b.setRemote('88.99.100.200');
            b.setLocal('10.0.1.8, 127.0.0.1, 192.168.0.2');

            var ip = a.findCommon(b);
            assert.equal('192.168.0.1', ip);
        });

        it('should return the remote IP address otherwise', function() {
            // And ignore the loopback address
            var b = new Addresses();
            b.setRemote('88.99.100.100');
            b.setLocal('10.0.1.8, 127.0.0.1, 192.168.0.2');

            var ip = a.findCommon(b);
            assert.equal('88.99.100.200', ip);
        });

        it('should prefer matching octects to character length', function() {
            // And ignore the loopback address
            var b = new Addresses();
            b.setRemote('88.99.100.200');
            b.setLocal('10.0.0.8, 127.0.0.1, 192.168.001.2');

            var ip = a.findCommon(b);
            assert.equal('10.0.0.1', ip);
        });
    });
});
