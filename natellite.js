var express = require('express');
var app    = express()
    http   = require('http'),
    server = http.createServer(app);

var RequestHandler = require('./lib/RequestHandler'),
    Natellite = require('./lib/Natellite');

var natellite = new Natellite();
var handler   = new RequestHandler(natellite);

app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.get('/', function(req, res){
    res.send('Natellite server. See /APP-ID for your app');
});

app.get('/:appid', function(req, res) {
    res.send('See <a href="online">online</a> for on-line clients, <a href="c/CLIENT-ID/send">c/CLIENT-ID/send</a> to send, <a href="c/CLIENT-ID/recv">c/CLIENT-ID/recv</a> to read.');
});

app.get('/:appid/c/:clientid/send', function(req, res) {
    res.send('POST a message to this URL to send');
});

app.post('/:appid/c/:clientid/send', function(req, res) {
    handler.postMessage(req.appid, req.clientid, req, res);
});

app.get('/:appid/c/:clientid/recv', function(req, res) {
    handler.readMessage(req.appid, req.clientid, req, res);
});


server.listen(3000);
console.log('Listening on port 3000');
