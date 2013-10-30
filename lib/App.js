var Client = require('./Client');
var util = require('./util');

function App(appid) {
    this.appid   = appid;
    this.clients = {};
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

module.exports = App;
