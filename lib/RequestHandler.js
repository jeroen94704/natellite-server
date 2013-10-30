var _ = require('underscore');
var Q = require('q');
var Addresses = require('./Addresses');
var Message   = require('./Message');

function RequestHandler(natellite) {
    this.natellite = natellite;
}

/**
 * Respond with a not-found message
 */
function respondNotFound(res) {
    res.send(404, 'No message found. Add ?block=true to wait for one.');
}

/**
 * Send a message to a response stream
 */
function respond(message, receiver, res) {
    if (!message) {
        respondNotFound(res);
        return;
    }

    res.status(200);
    res.set(message.headers);
    res.set({
        'From': message.senderid,
        'Timestamp': new Date(message.timestamp),
    });

    if (message.address) res.set({
        'Address': message.address.findCommon(receiver.addreses)
    });

    res.send(message.body);
}

/**
 * Get the client object for an action, updating it with headers from the request if applicable
 */
RequestHandler.prototype.getClient = function(appid, clientid, req) {
    var password       = req.headers['password'];
    var displayName    = req.headers['display-name'];
    var localAddresses = req.headers['local-address'];
    var remoteAddress  = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!password) throw new Error("Include a 'Password' header");

    return _(this.natellite.getApp(appid).getClientForAction(clientid, password)).tap(function(client) {
        if (displayName)    client.setDisplayName(displayName);
        if (localAddresses) client.setLocalAddresses(localAddresses.split(','));
        if (remoteAddress)  client.setRemoteAddresses(remoteAddress);
    });
};

function removeSpecialHeaders(headers) {
    delete headers['give-address'];
    delete headers['password'];
    delete headers['from'];
    delete headers['display-name'];
    delete headers['local-address'];
    delete headers['x-forwarded-for'];
}

function requestToMessageQ(sender, req) {
    var ret = Q.defer();
    var b   = [];

    req.on('data', function(data) {
        b.push(data);
    });

    req.on('end', function() {
        var m = new Message(sender.clientid, req.headers, b.join(''));
        if (m.headers['Give-Address']) m.address = new Addresses(sender.addresses);
        removeSpecialHeaders(m.headers);

        ret.resolve(m);
    });

    return ret.promise;
}

RequestHandler.prototype.readMessage = function(appid, clientid, req, res) {
    var block  = req.param('block');
    var client = this.getClient(appid, clientid, req);

    if (block) {
        client.dequeue().then(function(message) {
            respond(message, client, res);
        });
    } else {
        respond(client.peek(), client, res);
    }
}

RequestHandler.prototype.postMessage = function(appid, targetid, req, res) {
    var from = req.headers['from'];
    if (!from) throw new Error("Include a 'From' header");

    var sender = this.getClient(appid, from, req);
    var target = this.natellite.getApp(appid).getClient(targetid);

    requestToMessageQ(sender, req).then(function(message) {
        target.enqueue(message);
        res.send(200, 'Message sent');
    });
}

module.exports = RequestHandler;
