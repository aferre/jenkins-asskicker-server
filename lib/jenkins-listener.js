/* jslint node: true */
"use strict";
/*
 * Jenkins abstract listener. Should offer relted functions/callbacks 
 * to abstract multiple listeners implementations. Available jenkins plugins are:
 * websockets, udp notifications. Could provide http polling implementation as well.
 */

var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

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
    var users = getUsersToBlame(jobName);
    opts.callback(json, jobName, jobStatus, users);
};

function getUsersToBlame(jobName) {
    var t = opts.jenkinsData.url[0];
    t += 'job/' + jobName + '/lastFailedBuild/changes';

    var ur = url.parse(t, true);

    var formated = url.parse(url.format(ur), true);

    console.log(formated.path);

    var options = {
        host: formated.host,
        path: formated.path
    };

    var req = http.request(options, function(res) {
        var data = [];
        var chunks = 0;

        res.on('data', function(chunk) {
            chunks++;
            data.push(chunk);
        }).on('end', function() {
            var decoder = new StringDecoder('utf8');

            console.log('Retrieved ' + chunks + ' chunks.');

            var buffer = Buffer.concat(data);

            if (buffer.length === 0) {
                console.log("Retrieved empty data!");
            }
            else {
                var page = decoder.write(buffer);
                console.log(page);
                var regex = '/user/([^/"]+)';
                var users = [];
                var result = page.match(regex);
                for (var i = 0; i < result.length; i++) {
                    if (result[i].indexOf('/user') > -1) {

                    }
                    else {
                        users.push(result[i]);
                    }
                }

                console.log(users);
            }
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req.end();
}

exports.start = start;
exports.stop = stop;