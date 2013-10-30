var RequestHandler = require('../lib/RequestHandler');
var Natellite      = require('../lib/Natellite');
var Message        = require('../lib/Message');
var Addresses      = require('../lib/Addresses');
var assert         = require("assert");
var mocks          = require('./mocks');

describe('RequestHandler', function() {
    var handler;
    var natellite;

    beforeEach(function() {
        natellite = new Natellite();
        handler   = new RequestHandler(natellite);
    });

    describe('.readMessage()', function() {

        it('should return empty on no message', function() {
            var req = new mocks.Request({ 'password': 'abc' });
            var res = new mocks.Response();

            handler.readMessage('appid', 'clientid', req, res);

            assert.equal(404, res.statusCode);
        });

        it('should return a message when one is available', function() {
            natellite.getApp('appid').getClient('clientid').enqueue(new Message('sender', {
                'Content-Type' : 'text/plain'
            }, 'this is body'));

            var req = new mocks.Request({ 'password': 'abc' });
            var res = new mocks.Response();

            handler.readMessage('appid', 'clientid', req, res);

            assert.equal(200, res.statusCode);
            assert.equal('this is body', res.body);
            assert.equal('text/plain', res.headers['Content-Type']);
        });
        
        it('should write a message to res when called blocking', function(done) {
            var req = new mocks.Request({ 'password': 'abc', 'block': true });
            var res = new mocks.Response();

            res.bodyQ.then(function() {
                assert.equal('this is body', res.body);
                done();
            });

            handler.readMessage('appid', 'clientid', req, res);

            natellite.getApp('appid').getClient('clientid').enqueue(new Message('sender', {}, 'this is body'));
        });

        it('should include the remote address', function() {
            var m = new Message('sender', {}, 'this is body');
            m.address = new Addresses();
            m.address.setRemote('22.33.44.55');

            natellite.getApp('appid').getClient('clientid').enqueue(m);

            var req = new mocks.Request({ 'password': 'abc' });
            var res = new mocks.Response();

            handler.readMessage('appid', 'clientid', req, res);

            assert.equal(200, res.statusCode);
            assert.equal('22.33.44.55', res.headers['address']);
        });
    });

    describe('.postMessage()', function() {
        it('should deposit a message into the receiver queue', function(done) {
            var req = new mocks.Request({ 'password': 'abc', 'from': 'senderid' }, 'this is the message');
            var res = new mocks.Response();

            handler.postMessage('appid', 'targetid', req, res);

            natellite.getApp('appid').getClient('targetid').dequeue().then(function(message) {
                try {
                    assert.equal('this is the message', message.body);
                    assert.equal('senderid', message.senderid);
                    done();
                } catch (x) { done(x); }
            });
        });

        it('should include random extra headers', function(done) {
            var req = new mocks.Request({ 'password': 'abc', 'from': 'senderid', 'x-something': 'something' }, '');
            var res = new mocks.Response();

            handler.postMessage('appid', 'targetid', req, res);

            natellite.getApp('appid').getClient('targetid').dequeue().then(function(message) {
                try {
                    assert.equal('something', message.headers['x-something']);
                    done();
                } catch (x) { done(x); }
            });
        });


        it('should include the address', function(done) {
            var req = new mocks.Request({ 'password': 'abc', 'from': 'senderid', 'give-address': 'true' }, 'this is the message');
            var res = new mocks.Response();

            handler.postMessage('appid', 'targetid', req, res);

            natellite.getApp('appid').getClient('targetid').dequeue().then(function(message) {
                try {
                    assert.deepEqual(['22.33.44.55'], message.address.remote);
                    done();
                } catch (x) { done(x); }
            });
        });

        it('should not leave in sensitive data, regardless of case', function() {
            // FIXME: Write
        });
    });

    describe('.showOnlineClients()', function() {
        it('should include display name', function() {
            var req = new mocks.Request({ 'display-name': 'Long Display Name' });
            var res = new mocks.Response();

            handler.readMessage('appid', 'clientid', req, res);

            req = new mocks.Request();
            res = new mocks.Response();

            handler.showOnlineClients('appid', res);

            assert.equal('+ clientid Long Display Name', res.body);
        });
    });
});
