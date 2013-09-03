/* jslint node: true */
"use strict";
//var discoveredInstances = {};
var opts;

var start = function start(options) {
    opts = options;
    broadcast();
    setInterval(function () {
        broadcast();
    }, opts.pingInterval || 10000);
};

var stop = function stop() {
    //TODO handles options
};

function broadcast() {
    sendBroadcast('Long live Jenkins!', '255.255.255.255', 33848, function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            var parseString = require('xml2js').parseString;
            parseString(data, function (err, result) {
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

    socket.on("error", function (err) {
        cb(err);
    });
    socket.on("message", function (data) {
        cb(null, data);
    });
    socket.send(buffer, 0, buffer.length, port, host, function (err, message) {
        if (err) {
            cb(err);
        }
    });
    socket.setBroadcast(true);
}

function parseJenkins(jsonData) {
    var servId = jsonData.hudson["server-id"][0];
    if (servId) {
        console.log("Server " + servId + " is up.");
        opts.onJenkinsUpCb(jsonData.hudson);
    }
}


exports.start = start;
exports.stop = stop;