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
        rcli.get('jenkins:uuids:' + jsonData["server-id"][0], function (err, reply) {
            if (!reply || reply === 0) {
                // jenkins instance was never seen or was not up, notify
                rcli.set('jenkins:uuids:' + jsonData["server-id"][0], 1);
                opts.jenkinsStatusChanged(jsonData["server-id"][0], 'up');
            }
        });
    }
};

var jenDown = function _onJenkinsDown(jsonData) {
    if (jsonData) {
        var rcli = require('redis').createClient();
        rcli.get('jenkins:uuids:' + jsonData["server-id"][0], function (err, reply) {
            if (!reply || reply === 1) {
                // jenkins instance was never seen or was up, notify
                rcli.set('jenkins:uuids:' + jsonData["server-id"][0], 0);
                opts.jenkinsStatusChanged(jsonData["server-id"][0], 'down');
            }
        });
    }
};

exports.start = start;
exports.stop = stop;