function Message(senderid, headers, body) {
    this.senderid    = senderid;
    this.headers     = headers;
    this.body        = body;
    this.address     = null;
    this.timestamp   = Message.clock();
}

Message.clock = Date.now;

module.exports = Message;
