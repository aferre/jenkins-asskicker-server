/* jslint node: true */
"use strict";
//var discoveredInstances = {};
var opts;
var jenkinsMdns = require('./jenkins-discover.mdns');
var jenkinsUdp = require('./jenkins-discover.udp');

var start = function start(options) {
    opts = options;
    opts.onJenkinsUpCb = jenUp;
    opts.onJenkinsDownCb = jenDown;
    if (opts.udp) {
        jenkinsUdp.start(opts);
    }
    else if (opts.mdns) {
        jenkinsMdns.start(opts);
    }
    else {

    }
};

var stop = function stop() {
    if (opts.udp) {
        jenkinsUdp.stop();
    }
    else if (opts.mdns) {
        jenkinsMdns.stop();
    }
    else {

    }
};

var jenUp = function _onJenkinsUp(jsonData) {
    if (jsonData) {
        var rcli = require('redis').createClient();
        var srvId = jsonData["server-id"][0];
        rcli.get('jenkins:uuids:' + srvId, function(err, reply) {
            if (!reply || reply === "0") {
                // jenkins instance was never seen or was not up, notify
                var rcli2 = require('redis').createClient();
                rcli2.set('jenkins:uuids:' + srvId, 1);
                opts.jenkinsStatusChanged(srvId, 'up');
            }
        });
    }
};

var jenDown = function _onJenkinsDown(jsonData) {
    if (jsonData) {
        var rcli = require('redis').createClient();
        var srvId = jsonData["server-id"][0];
        rcli.get('jenkins:uuids:' + srvId, function(err, reply) {
            if (!reply || reply === "1") {
                // jenkins instance was never seen or was up, notify
                var rcli2 = require('redis').createClient();
                rcli2.set('jenkins:uuids:' + srvId, 0);
                opts.jenkinsStatusChanged(srvId, 'down');
            }
        });
    }
};

exports.start = start;
exports.stop = stop;