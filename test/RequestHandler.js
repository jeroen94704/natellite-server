var RequestHandler = require('../lib/RequestHandler');
var Natellite      = require('../lib/Natellite');
var Message        = require('../lib/Message');
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
    });

    describe('.postMessage()', function() {
        it.only('should deposit a message into the receiver queue', function(done) {
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

        it('should not leave in sensitive data, regardless of case', function() {
        });
    });

    describe('any message', function() {
        it('should update client info when doing a request', function() {
        });
    });
});
