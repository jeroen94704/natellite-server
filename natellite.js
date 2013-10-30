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
    handler.postMessage(req.params.appid, req.params.clientid, req, res);
});

app.get('/:appid/c/:clientid/recv', function(req, res) {
    handler.readMessage(req.params.appid, req.params.clientid, req, res);
});

app.get('/:appid/online', function(req, res) {
    handler.showOnlineClients(req.params.appid, res);
});

app.get('/:appid/c/:clientid/friends', function(req, res) {
    handler.showFriends(req.params.appid, req.params.clientid, req, res);
});

app.get('/:appid/c/:clientid/friends/:friendid', function(req, res) {
    res.send('POST to this URL to add a friend, DELETE to unfriend');
});

app.post('/:appid/c/:clientid/friends/:friendid', function(req, res) {
    handler.addFriend(req.params.appid, req.params.clientid, req, req.params.friendid);
    res.send('Added friend');
});

app.delete('/:appid/c/:clientid/friends/:friendid', function(req, res) {
    handler.removeFriend(req.params.appid, req.params.clientid, req, req.params.friendid);
    res.send('Removed friend');
});

app.get('/:appid/c/:clientid/ping', function(req, res) {
    handler.pingClient(req.params.appid, req.params.clientid, req);
    res.send('Pong!');
});

app.post('/:appid/c/:clientid/ping', function(req, res) {
    handler.pingClient(req.params.appid, req.params.clientid, req);
    res.send('Pong!');
});

// Exception handler (must be at the end, cos that's how the middleware chain works)
app.use(function(err, req, res, next) {
    res.send(500, err.message);
});


server.listen(3000);
console.log('Listening on port 3000');
