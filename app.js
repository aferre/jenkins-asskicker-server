/* jslint node: true */
"use strict";

var fs = require('fs');
var speakerQueue = require('./lib/speakerQueue');
var tts = require('node-google-tts');
var jenkinsDiscover = require('./lib/jenkins-discover');
var mdns = require('./lib/mdns');
var nconf = require('nconf');
var HashMap = require('hashmap').HashMap;
var jenkinsListeners = new HashMap();
nconf.argv().env();

nconf.add('config', {
    type: 'file',
    file: 'conf/config.json'
});

nconf.add('dictionary', {
    type: 'file',
    file: 'conf/dictionary.json'
});

nconf.load();

var grettingsDictionary = nconf.get("greetings");

function retrievedTTS(text, lang, data, redisUuid) {
    var rand = Math.floor(Math.random() * (10000000));
    //if (redisUuid && data === null) {
    if (redisUuid) {
        speakerQueue.postRedis("audio:data:tts:" + redisUuid);
    }
    else {
        var tempDir = fs.existsSync("/tmp/mp3files/");
        if (!tempDir) {
            fs.mkdirSync("/tmp/mp3files/");
        }
        fs.writeFile("/tmp/mp3files/" + rand + ".mp3", data, function(err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("The file was saved!");
                speakerQueue.postFile("/tmp/mp3files/" + rand + ".mp3");
            }
        });
    }
}

function randomValue(data) {
    var rand = Math.floor(Math.random() * (Object.keys(data).length));
    return data[Object.keys(data)[rand]];
}

function greetings(endCallback) {
    if (!grettingsDictionary || grettingsDictionary === "undefined") {
        return;
    }
    var rand = randomValue(grettingsDictionary);
    if (endCallback) {
        tts.retrieve(rand, 'en', endCallback);
    }
    else {
        tts.retrieve(rand, 'en', retrievedTTS);
    }
}

function jenkinsStatusChanged(jsonData, status) {
    var S = require('string');
    var jenkinsId = jsonData["server-id"][0];
    var str = S('' + jenkinsId.toString()).left(5).s;

    var listener = jenkinsListeners.get(jenkinsId);
    if (!listener) {
        listener = require('./lib/jenkins-listener');
        jenkinsListeners.set(jenkinsId, listener);
    }
    if (status === "up") {
        var jenkinsConfig = nconf.get('jenkins');
        listener.start({
            callback: jenkinsNotif,
            config: jenkinsConfig,
            websocket: "true",
            jenkinsData: jsonData
        });
    }
    else if (status === "down") {
        listener.stop();
    }

    tts.retrieve('Jenkins instance ' + str + ' is ' + status + '!', 'en', retrievedTTS);
}

function jenkinsNotif(notif, usersResponsible) {
    if (notif.status === "FAILED") {
        if (usersResponsible && usersResponsible != "undefined") {
            tts.retrieve(usersResponsible[0] + ', you failed... See project ' + notif.project, 'en', retrievedTTS);
        }
        else {
            tts.retrieve('Failed to build project ' + notif.project, 'en', retrievedTTS);
        }
    }
    else if (notif.status === "SUCCESS") {
        tts.retrieve('Successfully built project ' + notif.project, 'en', retrievedTTS);
    }
}

mdns.start(nconf.get("desc"));

jenkinsDiscover.start({
    jenkinsStatusChanged: jenkinsStatusChanged,
    udp: "test",
    initDate: new Date(),
    notifyUponRestart: nconf.get("jenkins").notifyUponRestart || false,
    interval: nconf.get("jenkins").udp.interval
});