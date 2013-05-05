var fs = require('fs');
var http = require('http');
var url = require('url');
var speakerQueue = require('./speakerQueue');
var tts = require('./tts');
var log = require('sys').log;
var dgram = require('dgram');

var redis = require("redis"),
    pubSubClient1 = redis.createClient(),
    pubSubClient2 = redis.createClient(),
    msg_count = 0;

var grettingsDictionary = {
    'bled': 'ouech ca va ou quoi?',
    'poli': 'Bonjour comment allez vous?'
};

pubSubClient1.on("subscribe", function(channel, count) {
    pubSubClient2.publish("a nice channel", "I am sending a message.");
    pubSubClient2.publish("a nice channel", "I am sending a second message.");
    pubSubClient2.publish("a nice channel", "I am sending my last message.");
});

pubSubClient1.on("message", function(channel, message) {
    console.log("pubSubClient1 channel " + channel + ": " + message);
});

pubSubClient1.incr("did a thing");
pubSubClient1.subscribe("a nice channel");

function randomValue(data) {
    var rand = Math.floor(Math.random() * (Object.keys(data).length));
    return data[Object.keys(data)[rand]];
}

function greetings(endCallback) {
    var rand = randomValue(grettingsDictionary);
    if (endCallback) {
        tts.retrieve(rand, 'fr', endCallback);
    }
    else {
        tts.retrieve(rand, 'fr', retrievedTTS);
    }
}

function retrievedTTS(text, lang, data) {
    var rand = Math.floor(Math.random() * (10000000));

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

/*
 *
 */

greetings();

tts.retrieve('ouech ça va ou quoi, bien ou bien ma gueule? j\'vais te zlatané la tête tu vas voir ', 'fr', retrievedTTS);

var server = dgram.createSocket("udp4");

server.on('error', function(err) {
    console.log("updtest: on error: " + err.stack);
});

server.on("message", function(msg, rinfo) {
    console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
    try {
        var json = JSON.parse(msg);
        console.log(json);
        pubSubClient2.publish("a nice channel", json);
    }
    catch (err) {
        pubSubClient2.publish("a nice channel", msg);
    }
});


server.on("listening", function() {
    var address = server.address();
    console.log("server listening " + address.address + ":" + address.port);
});

server.bind(2222);