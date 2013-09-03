/* jslint node: true */
"use strict";
//var discoveredInstances = {};
var mdns = require('mdns');
var opts;

var browser = mdns.createBrowser(mdns.tcp('jenkins'));

browser.on('serviceUp', function (service) {
    console.log("service up: ", service);
    opts.onJenkinsUpCb(service.txtRecord);
});

browser.on('serviceDown', function (service) {
    console.log("service down: ", service);
     opts.onJenkinsUpDown(service.txtRecord);
});

var start = function start(options) {
    opts = options;
    if (browser._watcherStarted === false) {
        browser.start();
    }
};

var stop = function stop() {
    if (browser._watcherStarted === true) {
        browser.stop();
    }
};

exports.start = start;
exports.stop = stop;