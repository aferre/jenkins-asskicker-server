/* jslint node: true */
"use strict";
/*
 * Jenkins abstract listener. Should offer relted functions/callbacks 
 * to abstract multiple listeners implementations. Available jenkins plugins are:
 * websockets, udp notifications. Could provide http polling implementation as well.
 */

var opts;
var listener;

var start = function start(options) {
    opts = options;
    var ops;
    //TODO handles options
    if (opts.websocket) {
        ops = opts.config.websocket;
        ops.built = built;
        ops.jenkinsData = opts.jenkinsData;
        listener = require('./jenkins-listener.ws');
        listener.start(ops);
    }
    else if (opts.udp) {
        ops = opts.config.udp;
        ops.jenkinsData = opts.jenkinsData;
        listener = require('./jenkins-listener.udp');
        ops.built = built;
        listener.start(ops);
    }
    else if (opts.ext) {

    }
};

var stop = function stop() {
    //TODO handles options
    listener.stop();
};

var built = function built(json, jobName, jobStatus) {
    console.log("jenkins build finished " + JSON.stringify(json));
    var jenkinsapi = require('jenkins-api');

    var jen = jenkinsapi.init(opts.jenkinsData.url);
    jen.build_info(jobName, json.number, function(error, data) {
        if (!error) {
            console.log(data);
            opts.callback(json, jobName, jobStatus, data.culprits);
        }
    });

};

exports.start = start;
exports.stop = stop;