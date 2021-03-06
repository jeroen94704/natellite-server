var _ = require('underscore');
var Q = require('q');

function Request(params, body) {
    var self = this;

    self.headers = params || {};
    self.connection = {
        remoteAddress: '22.33.44.55'
    }

    self.param = function(name) {
        return self.headers[name];
    }

    self.on = function(event, callback) {
        if (event == 'data') callback(body);
        if (event == 'end') callback();
    }
}

function Response() {
    var self        = this;
    self.headers    = {};
    self.statusCode = '';
    self.body       = '';

    var deferred    = Q.defer();
    self.bodyQ      = deferred.promise;

    self.set = function(values) {
        _.extend(self.headers, values);
    }

    self.status = function(status) {
        self.statusCode = status;
    }

    self.send = function(statusOrBody, body) {
        if (body === undefined) {
            self.statusCode = 200;
            self.body       = statusOrBody;
        } else {
            self.statusCode = statusOrBody;
            self.body       = body;
        }

        deferred.resolve();
    }
}

module.exports = {
    Request: Request,
    Response: Response
}
