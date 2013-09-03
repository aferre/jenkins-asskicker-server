/* jslint node: true */
"use strict";

var fs = require('fs');
var speakerQueue = require('./speakerQueue');
var tts = require('./tts');
var jenkinsDiscover = require('./jenkins-discover');
var jenkinsListener = require('./jenkins-listener');
var nconf = require('nconf');
var mdns = require('mdns');

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

function handleAdvertisementError(error) {
    switch (error.errorCode) {
    case mdns.kDNSServiceErr_Unknown:
        console.warn(error);
        setTimeout(advertise, 5000);
        break;
    default:
        throw error;
    }
}

function advertise() {
    try {
        var desc = nconf.get("desc");
        var txt_record = {};
        txt_record.location = desc.location;
        txt_record.users = JSON.stringify(desc.users);
        var ad = mdns.createAdvertisement(mdns.tcp('jenkins-kicker'), 4321, {
            txtRecord: txt_record,
            networkInterface: "eth2"
        });
        ad.on('error', handleAdvertisementError);
        ad.start();
    }
    catch (ex) {
        handleAdvertisementError(ex);
    }
}

var grettingsDictionary = nconf.get("greetings");

function retrievedTTS(text, lang, data, redisUuid) {
    var rand = Math.floor(Math.random() * (10000000));
    if (redisUuid && data === null) {
        speakerQueue.postRedis("audio:data:tts:" + redisUuid);
    }
    else {
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


function jenkinsStatusChanged(jenkinsId, status) {
    var S = require('string');
    var str = S('' + jenkinsId.toString()).left(5).s;
    tts.retrieve('Jenkins instance ' + str + ' is ' + status + '!', 'en', retrievedTTS);
}
/*
 *
 */

/*greetings();
greetings();
greetings();
greetings();
*/
//tts.retrieve('ouech ça va ou quoi, bien ou bien ma gueule? j\'vais te zlatané la tête tu vas voir ', 'fr', retrievedTTS);

function jenkinsNotif(notif, usersResponsible) {
    tts.retrieve(usersResponsible[0] + ' tu me decois.', 'fr', retrievedTTS);
}


var browser = mdns.createBrowser(mdns.tcp('jenkins-kicker'));

browser.on('serviceUp', function(service) {
    console.log("service up: ", service);

    console.log("service up: ", JSON.parse(service.txtRecord.users));
});

browser.on('serviceDown', function(service) {
    console.log("service down: ", service);
});

browser.start();

advertise();

var jenkinsConfig = nconf.get('jenkins');

jenkinsListener.start({
    callback: jenkinsNotif,
    config: jenkinsConfig
});

jenkinsDiscover.start({
    jenkinsStatusChanged: jenkinsStatusChanged
});