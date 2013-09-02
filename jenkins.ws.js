/*
 * Jenkins udp notification listener. 
 * Need to use the notifier plugin available in the jenkins plugins list.
 */
var http = require('http');
var url = require('url');
var dgram = require('dgram');
var jenkinsapi = require('jenkins-api');
var jenkins = jenkinsapi.init("http://localhost:8080/jenkins");
var StringDecoder = require('string_decoder').StringDecoder;
var opts;
var redis = require("redis"),
    pubSubClient = redis.createClient();

var WebSocket = require('ws');

function parse(msg) {
    var json = JSON.parse(msg);
    return json;
}

var start = function start(options) {
    opts = options;
    //TODO handles options
    if (opts.config === "undefined") return;
    var url = 'ws://localhost';
    url += ':' + opts.config.websocket.port;
    url += '/jenkins';
    var ws = new WebSocket(url);
    ws.on('open', function() {
        console.log("soket opened");
    });
     ws.on('error', function() {
        console.log("soket errored");
    });
    ws.on('message', function(data, flags) {
        console.log(data);
        console.log(flags);
        // flags.binary will be set if a binary data is received
        // flags.masked will be set if the data was masked
    });

    jenkins.all_jobs(function(err, data) {
        if (err) {
            return console.log(err);
        }
        if (data === "undefined") {
            return console.log("no data received");
        };
        if (data.length === 0) {
            console.log("empty data");
        }
        else {
            for (var i = 0, len = data.length; i < len; i++) {
                var job = data[i];
                console.log(job);
                jenkins.job_info(job.name, function(err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log(data);
                });

            }
        }
        console.log(data);
    });

};

var stop = function stop() {
    //TODO handles options
};


function getJobName(json) {
    return json.name;
}

function getBuildPhase(json) {
    return json.build.phase;
}

function getBuildStatus(json) {
    return json.build.status;
}

function getBuildUrl(json) {
    return json.build.full_url;
}

function getUserToBlame(json) {

    var jobUrl = getBuildUrl(json);
    var jobName = getJobName(json);

    var t = "http://jenkins.saic.int/job/" + jobName + "/lastFailedBuild/changes";

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
                if (opts.callback) opts.callback(json, users);
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