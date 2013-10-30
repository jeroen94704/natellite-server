var express = require('express');
var app     = express();
var http    = require('http');
var server  = http.createServer(app);
var _       = require('underscore');

var RequestHandler = require('./lib/RequestHandler'),
    Natellite = require('./lib/Natellite');

var natellite = new Natellite();
var handler   = new RequestHandler(natellite);

app.get('/', function(req, res){
    res.send('Natellite server. See <a href="/APP-ID">/APP-ID</a> for your app');
});

app.get('/:appid', function(req, res) {
    res.send(_.template(
            '<ul>'
            + '<li>Online clients: <a href="/<%= appid %>/online">/<%= appid %>/online</a></li>'
            + '<li>Send a message: POST to <a href="/<%= appid %>/c/CLIENT-ID/send">/<%= appid %>/c/CLIENT-ID/send</a></li>'
            + '<li>Read a message: <a href="/<%= appid %>/c/CLIENT-ID/recv">/<%= appid %>/c/CLIENT-ID/recv</a></li>'
            + '<p>Include <tt>Password</tt> header if you want to secure your account.</p>'
            + '</ul>',
            req.params));
});

app.get('/:appid/c/:clientid/send', function(req, res) {
    res.send('POST a message to this URL to send');
});

app.post('/:appid/c/:clientid/send', function(req, res) {
    try {
        handler.postMessage(req.params.appid, req.params.clientid, req, res);
    } catch (e) {
        res.send(500, e.message);
    }
});

app.get('/:appid/c/:clientid/recv', function(req, res) {
    try {
        handler.readMessage(req.params.appid, req.params.clientid, req, res);
    } catch (e) {
        res.send(500, e.message);
    }
});


server.listen(3000);
console.log('Listening on port 3000');
