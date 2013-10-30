var _ = require('underscore');

function Addresses() {
    this.local  = [];
    this.remote = [];
}

function parseIpList(ips) {
    if (_(ips).isArray())
        return ips;
    else
        return _(ips.split(",")).map(function(x) { return x.trim(); });
}

Addresses.prototype.setRemote = function(ips) {
    this.remote = parseIpList(ips);
}

Addresses.prototype.setLocal = function(ips) {
    this.local = _(parseIpList(ips)).filter(function(x) {
        return !x.match(/^127.0.0./);
    });
}

Addresses.prototype.clearLocal = function() {
    this.local = [];
}

function sharedOctetLen(a, b) {
    if (a.indexOf(':') >= 0) {
        // IPv6
        a = a.split(':');
        b = b.split(':');
    } else {
        // IPv4
        a = a.split('.');
        b = b.split('.');
    }

    var i = 0;
    while (i < a.length && i < b.length && a[i] == b[i]) i++;
    return i;
}

/**
 * Find the address that the clients probably have in common
 *
 * Typically, the local address if the remote addresses are
 * the same, and the remote address otherwise.
 */
Addresses.prototype.findCommon = function(that) {
    if (_(this.remote).intersection(that.remote).length) {
        // Shared remote address: find the local IP address
        // with the longest shared prefix
        var sorted = _(this.local).sortBy(function(ip) {
            return - _.chain(that.local)
                      .map(function(thatip) {
                          return sharedOctetLen(ip, thatip);
                      }).max().value();
        });
        if (sorted.length) return sorted[0];
    } else {
        // No shared remote address
        if (this.remote.length) return this.remote[0];
    }
    return '';
}

module.exports = Addresses;
