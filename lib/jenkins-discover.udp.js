/* jslint node: true */
"use strict";
var opts;
var HashMap = require('hashmap').HashMap;
var discoveredInstances = new HashMap();
var discoverInterval;

var start = function start(options) {
    opts = options;
    broadcast();
    discoverInterval = setInterval(function() {
        var now = new Date();
        discoveredInstances.forEach(function(value, key) {
            if (value.lastUp) {
                var lastUp = new Date(value.lastUp);
                if (now - lastUp > (opts.consideredDownInterval || 20000)) {
                    console.log("Server " + value["server-id"] + " is down.");
                    opts.onJenkinsDownCb(value);
                }
            }

        });
        broadcast();
    }, opts.interval || 10000);
};

var stop = function stop() {
    //TODO handles options
    if (discoverInterval) {
        clearInterval(discoverInterval);
    }
};

function broadcast() {
    sendBroadcast('Ping', '255.255.255.255', 33848, function(err, data) {
        if (err) {
            console.log(err);
        }
        else {
            var parseString = require('xml2js').parseString;
            console.log(data);
            parseString(data, function(err, result) {
                if (err) {

                }
                else {
                    if (result) {
                        parseJenkins(result);
                    }
                }
            });
        }
    });
}

function sendBroadcast(message, host, port, cb) {
    var socket = require('dgram').createSocket('udp4'),
        buffer = new Buffer(message);

    socket.on("error", function(err) {
        cb(err);
    });
    socket.on("message", function(data) {
        cb(null, data);
    });
    socket.send(buffer, 0, buffer.length, port, host, function(err, message) {
        if (err) {
            cb(err);
        }
    });
    socket.setBroadcast(true);
}

function parseJenkins(jsonData) {
    var res = {};
    res["server-id"] = jsonData.hudson["server-id"][0];
    res["slave-port"] = jsonData.hudson["slave-port"][0];
    res.url = jsonData.hudson.url[0];
    res.version = jsonData.hudson.version[0];
    var servId = res["server-id"];
    if (servId) {
        console.log("Server " + servId + " is up.");
        res.lastUp = new Date();
        discoveredInstances.set(servId, res);
        opts.onJenkinsUpCb(res);
    }
}

exports.start = start;
exports.stop = stop;