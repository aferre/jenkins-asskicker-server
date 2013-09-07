/* jslint node: true */
"use strict";
/*
 * Jenkins udp notification listener. 
 * Need to use the notifier plugin available in the jenkins plugins list.
 */
var opts;

var WebSocket = require('ws');

function parse(msg) {
    var json = JSON.parse(msg);
    return json;
}

var start = function start(options) {
    opts = options;
    //TODO handles options
    if (opts === "undefined") {
        return;
    }
    var urlUtil = require("url");
    var ur = urlUtil.parse(options.jenkinsData.url[0]);

    var url = 'ws://' + ur.hostname;
    url += ':' + opts.port || 10000;
    url += '/jenkins';
    var ws = new WebSocket(url);
    ws.on('open', function() {
        console.log("soket opened");
    });
    ws.on('error', function(err) {
        console.log("soket errored");
    });
    ws.on('message', function(data, flags) {
        var job = JSON.parse(data);
        opts.built(job, job.project, job.status);
    });
};

var stop = function stop() {
    //TODO handles options
};

exports.start = start;
exports.stop = stop;