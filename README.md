Natellite
=========

A message relaying and peer discovery service for the Web Of Things (or simple peer-to-peer apps).

Introduction
------------

If you're hacking on an Arduino, or want to make a peer-to-peer app, you want to be able to send messages between peers, without necessarily knowing their IP address. They may not even be routable, and setting up a client-server infrastructure or punching a hole in your NAT route is a hassle.

Natellite fixes this by being a central server that all clients connect to (inside-out connections will pass through your NAT router) and will relay messages on behalf of your apps.

Identification
--------------

Apps are identified by an App ID. Instances of an app are identified by a Client ID. A client picks its own ID. It is up to the client code to pick IDs such that collissions do not happen. The first time a particular Client ID is used, the client associates a password with the ID. After that, the same password must be presented every time to READ messages in the queue.

A client can associate a Display Name with its ID.

A client can send any number of local IP addresses to the server.


    Client:
    - appid
    - clientid
    - password
    - displayName
    - local ip*
    - lastSeen (maintained by server)
    - Public IP (maintained by server)

> App IDs can still be hijacked. Is that a problem?

Message Passing
---------------

Any message POSTed to `http://server/APP-ID/c/CLIENT-ID/send` will be deposited in that client's queue. 

Rules:

* `APP-ID` and `CLIENT-ID` must be known or the message will be rejected.
* Messages larger than 100KB will be rejected.
* Headers with special meaning:
    * `From`, `Password`, `Display-Name`: `CLIENT-ID`, password, display name of the sender (required). Client ID is assumed to be in the same app.
    * `Give-Address: true` will cause the receive to receive the most appropriate IP address on which it can probably contact the sender.
* Other headers will be passed on to the receiver (`Content-Type`, `Content-Encoding`, etc.)

.

    Message:
    - appid
    - receiverid
    - senderid
    - publishIp
    - timestamp
    - headers*
    - body


Message Reading
---------------

GETting `http://server/APP-ID/c/CLIENT-ID/recv` will read the next message from the queue, or return a failure if there is no such message. Appending `?block=true` will cause the request to hang until a message is available or the connection timeout is reached (this allows long-polling which leads to quicker response times).

Request headers:

* `Password`, `Display-Name`: password, display name of reader.

The message will be received as sent, with the following headers added by the server:

* `From`: Client-ID of sender.
* `Timestamp`: Timestamp when message was initially delivered to server.
* `Address`: if the sender included `Give-Address`, the IP address on which the sender can probably be reached (port number should be communicated in some other way).

Every message is delivered at most once, so if the client crashes after reading a message but before handling it: too bad.

Discovery
---------

* `http://server/APP-ID/online`: all (on-line) clients of that App-ID.
* `http://server/APP-ID/c/CLIENT-ID/friends`: all friends of the given client (requires `X-Password`).

On-line is defined as last-seen less than 5 minutes ago. The response is a UTF-8 text file, with every line consisting of:

    ("+" | "-") CLIENT-ID " " DISPLAY-NAME
    
* `http://server/APP-ID/c/CLIENT-ID-A/friends/CLIENT-ID-B`: POSTing to this URL adds client B to the friends list of client A. DELETEing removes the friend from the list. (Requires `X-Password`).

* `http://server/APP-ID/c/CLIENT-ID-A/ping` can be used to report liveness (although you should probably never use this because you can just as easily read from the queue).

Address Passing
---------------

If a sender specifies `Give-Address`, the receiver will receive the IP address of the sender, according to the following rules:

* If *Public IP*s are different, the value of *Public IP*.
* Otherwise, one of the *Local IP*s that matches one the *Local IP*s of the receiver, according to heuristics (because we don't know the subnets). `127.x.x.x` will never be matched, even if it is reported as a local IP.


Garbage Collection
------------------

This system contains a lot of soft state, which will need to be cleaned regularly. Unused client IDs and messages will be cleaned up if they are not used in 30 days.

Maybe clean up messages according to size (i.e., larger messages first).

Abuse Protection
----------------
IP addresses will need to be throttled to payload size per second.

Future Features
---------------
- Request/Response (although we could fake it at the app level).

Client Libraries
----------------

For good compatibility, I'll need client libraries for:

- Arduino
- Java
- C#
- JavaScript (Node.js, browser w/ CORS)

Sample apps:

- Chat
- Screenshot sharing