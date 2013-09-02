/*
 * Jenkins abstract listener. Should offer relted functions/callbacks 
 * to abstract multiple listeners implementations. Available jenkins plugins are:
 * websockets, udp notifications. Could provide http polling implementation as well.
 */
var opts;
var listener;

var start = function start(options) {
    opts = options;
    //TODO handles options
    if (opts.websocket) {
        listener = require('jenkins-listener.ws');
        listener.start(opts.websocket);
    }
    else if (opts.udp) {
        listener = require('jenkins-listener.udp');
        listener.start(opts.udp);
    }
    else if (opts.ext) {

    }
};

var stop = function stop() {
    //TODO handles options
};

exports.start = start;
exports.stop = stop;