/* jslint node: true */
"use strict";
/*
 * Jenkins ws notification listener. 
 * Need to use the websocket plugin available in the jenkins plugins list.
 */
var dgram = require('dgram');
var server;
var opts;
var stopped = true;

var start = function start(options) {
    opts = options;
    server = dgram.createSocket("udp4");
    server.bind(opts.port || 2222);

    server.on("error", function(err) {
        console.log("updtest: on error: " + err.stack);
    });

    server.on("message", function(msg, rinfo) {
        console.log("Message : " + msg + " from " + rinfo.address + ":" + rinfo.port);
        var json = JSON.parse(msg);
        if (json.build.phase === "FINISHED" && json.build.status) {
            opts.built(json, json.name, json.build.status);
        }
    });

    server.on("listening", function() {
        stopped = false;
        var address = server.address();
        console.log("server listening " + address.address + ":" + address.port);
    });

    server.on("close", function() {
        stopped = true;
    });
};

var stop = function stop() {
    if (server && !stopped) {
        server.close();
    }
};

exports.start = start;
exports.stop = stop;