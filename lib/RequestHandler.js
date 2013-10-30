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
function respond(message, res) {
    if (!message) {
        respondNotFound(res);
        return;
    }

    res.status(200);
    res.set(message.headers);
    res.set({
        'From': message.senderid,
        'Timestamp': new Date(message.timestamp),
        'Address':
    });
    res.send(body);
}


RequestHandler.prototype.readMessage = function(appid, clientid, req, res) {
    var password       = req.headers['password'];
    var displayName    = req.headers['display-name'];
    var localAddresses = res.headers['local-address'];
    var block          = req.param('block');
    var remoteAddress  = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!password) throw new Error("Include a 'Password' header");

    var client = this.natellite.getApp(appid).getClientForAction(clientid, password);
    if (displayName) client.setDisplayName(displayName);
    if (localAddresses) client.setLocalAddresses(localAddresses.split(','));
    if (remoteAddress) client.setRemoteAddresses(remoteAddress);

    if (block) {
        client.dequeue().then(function(message) {
            respond(message, res);
        });
    } else {
        respond(client.peek(), res);
    }
}

module.exports = RequestHandler;