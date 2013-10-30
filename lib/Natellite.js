var App = require('./App');
var util = require('./util');

function Natellite() {
    this.apps = {};
}

Natellite.prototype.getApp = function(appid) {
    appid = appid.toString();
    if (!util.validSlug(appid)) throw new Error('Invalid ID: ' + appid);

    var key = 'a-' + appid;
    if (!this.apps.hasOwnProperty(key)) this.apps[key] = new App(appid);

    return this.apps[key];
}

module.exports = Natellite;
