function Message(senderid, headers, body) {
    if (typeof(headers) != 'object') throw new Error('Headers should be an object');

    this.senderid    = senderid;
    this.headers     = headers;
    this.body        = body;
    this.address     = null;
    this.timestamp   = Message.clock();
}

Message.clock = Date.now;

module.exports = Message;
