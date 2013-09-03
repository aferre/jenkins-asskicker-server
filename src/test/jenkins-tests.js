/* jslint node: true */
"use strict";
var dgram = require('dgram');
var client = dgram.createSocket("udp4");

var test1 = {
    "name": "G2-Server-WS",
    "url": "JbUrl",
    "build": {
        "number": 1,
        "phase": "STARTED",
        "status": "FAILED",
        "url": "job/project/5",
        "full_url": "http://ci.jenkins.org/job/project/5",
        "parameters": {
            "branch": "master"
        }
    }
};

var message = new Buffer(JSON.stringify(test1));

client.send(message, 0, message.length, 2222, "localhost", function(err, bytes) {
  client.close();
});