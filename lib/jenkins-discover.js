/* jslint node: true */
"use strict";
//var discoveredInstances = {};
var opts;
var jenkinsDiscoverImpl;
var init;

var start = function start(options) {
    opts = options;
    opts.onJenkinsUpCb = jenUp;
    opts.onJenkinsDownCb = jenDown;
    init = options.notifyUponRestart;
    jenkinsDiscoverImpl = require('./jenkins-discover.' + (opts.preferredDiscoveryImpl || "udp"));
    jenkinsDiscoverImpl.start(opts);
};

var stop = function stop() {
    jenkinsDiscoverImpl.stop();
};

var jenUp = function _onJenkinsUp(jsonData) {
    if (jsonData) {
        var rcli = require('redis').createClient();
        var srvId = jsonData["server-id"];
        rcli.get('jenkins:uuids:' + srvId, function(err, reply) {
            if (!reply || reply === "0" || init) {
                init = false;
                // jenkins instance was never seen or was not up, notify
                var rcli2 = require('redis').createClient();
                rcli2.set('jenkins:uuids:' + srvId, 1);
                opts.jenkinsStatusChanged(jsonData, 'up');
            }
        });
    }
};

var jenDown = function _onJenkinsDown(jsonData) {
    if (jsonData) {
        var rcli = require('redis').createClient();
        var srvId = jsonData["server-id"];
        rcli.get('jenkins:uuids:' + srvId, function(err, reply) {
            if (!reply || reply === "1" || init) {
                init = false;
                // jenkins instance was never seen or was up, notify
                var rcli2 = require('redis').createClient();
                rcli2.set('jenkins:uuids:' + srvId, 0);
                opts.jenkinsStatusChanged(jsonData, 'down');
            }
        });
    }
};

exports.start = start;
exports.stop = stop;