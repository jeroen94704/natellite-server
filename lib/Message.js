function Message(senderid, headers, body) {
    this.senderid    = senderid;
    this.headers     = headers;
    this.body        = body;
    this.sendAddress = null;
    this.timestamp   = Message.clock();
}

/**
 * Set IP of sender
 */
Message.prototype.setAddresses = function(addresses) {
    this.senderIp = ip;
}

Message.clock = Date.now;

module.exports = Message;
