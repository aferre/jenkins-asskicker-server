var fs = require('fs');
var speakerQueue = require('./speakerQueue');
var tts = require('./tts');
var jenkins = require('./jenkins');
var nconf = require('nconf');
var dic = require('nconf');

  nconf.argv()
       .env()
       .file({ file: 'config.json' });
       
       
  dic.argv()
       .env()
       .file({ file: 'dictionary.json' });
       
var grettingsDictionary = dic.get("greetings");

function randomValue(data) {
    var rand = Math.floor(Math.random() * (Object.keys(data).length));
    return data[Object.keys(data)[rand]];
}

function greetings(endCallback) {
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

/*
 *
 */

greetings();

tts.retrieve('ouech ça va ou quoi, bien ou bien ma gueule? j\'vais te zlatané la tête tu vas voir ', 'fr', retrievedTTS);

function jenkinsNotif(notif, usersResponsible) {
    tts.retrieve(usersResponsible[0] + ' tu me decois.', 'fr', retrievedTTS);
}

jenkins.start({
    callback: jenkinsNotif,
    port: 2222
});