var Client = require('./Client');
var util   = require('./util');
var _      = require('underscore');

function App(appid) {
    this.appid   = appid;
    this.clients = {};
}

App.prototype.getExistingClient = function(clientid) {
    clientid = clientid.toString();
    if (!util.validSlug(clientid)) throw new Error('Invalid ID: ' + clientid);

    var key = 'c-' + clientid;
    if (!this.clients.hasOwnProperty(key)) return null;
    return this.clients[key];
}

App.prototype.getClient = function(clientid) {
    clientid = clientid.toString();
    if (!util.validSlug(clientid)) throw new Error('Invalid ID: ' + clientid);

    var key = 'c-' + clientid;
    if (!this.clients.hasOwnProperty(key)) this.clients[key] = new Client(clientid);

    return this.clients[key];
}

/**
 * Get a client object with the purpose to perform an action with it
 */
App.prototype.getClientForAction = function(clientid, password) {
    var client = this.getClient(clientid);
    client.authenticate(password);
    client.performsAction();
    return client;
}

/**
 * Return all online clients, use a writer object with a .data(client)
 * and .done() message for the 
 */
App.prototype.getOnlineClients = function(formatter) {
    return _.chain(this.clients).filter(function(c) {
        return c.isOnline();
    }).map(formatter).value();
}

App.prototype.getClients = function(clientids, formatter) {
    return _.chain(clientids)
        .map(_(this.getExistingClient).bind(this))
        .filter(function(x) { return x; })
        .map(formatter)
        .value();
}

module.exports = App;
