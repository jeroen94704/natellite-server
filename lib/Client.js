var ONLINE_TIMEOUT = 5 * 60 * 1000;

var Message   = require('./Message');
var Addresses = require('./Addresses');
var Q = require('q');

function Client(clientid) {
    this.clientid    = clientid;
    this.password    = null;
    this.displayName = '';
    this.addresses   = new Addresses();
    this.lastSeen    = 0;

    this.queue       = [];
    this.friendids   = [];
    
    this.waiting     = [];

    this.performsAction();
}

Client.prototype.performsAction = function() {
    if (!this.isOnline()) this.justCameOnline();
    this.lastSeen = Client.clock();
};

Client.prototype.isOnline = function() {
    return Client.clock() - this.lastSeen <= ONLINE_TIMEOUT;
};

Client.prototype.authenticate = function(password) {
    if (this.password == null) this.password = password;
    if (this.password != password) throw Error('Invalid password');
}

Client.prototype.updateDisplayName = function(displayName) {
    this.displayName = displayName;
}

/**
 * Deliver a message to the queue, optionally notifying a sender
 */
Client.prototype.enqueue = function(message) {
    var deferred = this.waiting.shift();
    if (deferred)
        deferred.resolve(message);
    else
        this.queue.push(message);
};

/**
 * Return a promise for the next message in the queue
 *
 * If there are multiple dequeues for the same message, only
 * one will be returned.
 */
Client.prototype.dequeue = function() {
    var deferred = Q.defer();

    var msg = this.queue.shift();
    if (msg)
        deferred.resolve(msg);
    else
        this.waiting.push(deferred);

    return deferred.promise;
}

/**
 * Returns the next message in the queue, if there is any, and dequeues it
 */
Client.prototype.peek = function() {
    return this.queue.shift();
}

Client.prototype.setDisplayName = function(displayName) {
    this.displayName = displayName;
}

Client.prototype.setLocalAddresses = function(ips) {
    this.addresses.setLocal(ips);
}

Client.prototype.setRemoteAddresses = function(ips) {
    this.addresses.setRemote(ips);
}

Client.prototype.justCameOnline = function() {
    this.addresses.clearLocal();
}

Client.clock = Date.now;

module.exports = Client;
