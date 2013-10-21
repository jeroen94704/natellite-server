function Message(senderid, headers, body) {
    this.senderid  = senderid;
    this.headers   = headers;
    this.body      = body;
    this.senderIp  = null;
}

/**
 * Set IP of sender
 */
Message.prototype.setIp = function(ip) {
    this.senderIp = ip;
}

module.exports = Message;
