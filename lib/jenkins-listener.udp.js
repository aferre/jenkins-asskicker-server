/* jslint node: true */
"use strict";
/*
 * Jenkins ws notification listener. 
 * Need to use the websocket plugin available in the jenkins plugins list.
 */
var dgram = require('dgram');
var jenkinsPort = 2222;
var server = dgram.createSocket("udp4");
var opts;

function parse(msg) {
    var json = JSON.parse(msg);
    return json;
}

server.on("error", function(err) {
    console.log("updtest: on error: " + err.stack);
});

server.on("message", function(msg, rinfo) {
    console.log("Message : " + msg + " from " + rinfo.address + ":" + rinfo.port);
    var json = parse(msg);
    opts.built(json);
});

server.on("listening", function() {
    var address = server.address();
    console.log("server listening " + address.address + ":" + address.port);
});

var start = function start(options) {
    opts = options;
    //TODO handles options
    server.bind(jenkinsPort);
};

var stop = function stop() {
    //TODO handles options
    server.close();
};

exports.start = start;
exports.stop = stop;