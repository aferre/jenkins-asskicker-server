'use strict';

var fs = require('fs');
var speakerQueue = require('./speakerQueue');
var tts = require('./tts');
var jenkinsDiscover = require('./jenkins-discover');
var jenkinsListener = require('./jenkins-listener');
var nconf = require('nconf');
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

function randomValue(data) {
    var rand = Math.floor(Math.random() * (Object.keys(data).length));
    return data[Object.keys(data)[rand]];
}

function greetings(endCallback) {
    if (!grettingsDictionary || grettingsDictionary === "undefined") return;
    var rand = randomValue(grettingsDictionary);
    if (endCallback) {
        tts.retrieve(rand, 'en', endCallback);
    }
    else {
        tts.retrieve(rand, 'en', retrievedTTS);
    }
}

function retrievedTTS(text, lang, data, redisUuid) {
    var rand = Math.floor(Math.random() * (10000000));
    if (redisUuid && data === null) speakerQueue.postRedis("audio:data:tts:" + redisUuid);
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

var jenkinsConfig = nconf.get('jenkins');

jenkinsListener.start({
    callback: jenkinsNotif,
    config: jenkinsConfig
});

jenkinsDiscover.start({
    jenkinsStatusChanged: jenkinsStatusChanged
});