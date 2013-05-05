/*
 *speaker
 */
var Speaker = require('speaker');
var lame = require('lame');

var log = require('sys').log;
var speakerAvailable = true;
var redis = require("redis");
var fs = require('fs');

var redisConsumer = redis.createClient();

redisConsumer.on('connect', function() {
    console.log("CONNECTED: ");
});

redisConsumer.on('ready', function() {
    console.log("READY: ");
});

redisConsumer.on('end', function() {
    console.log("ENDED: ");
});

function waitOnData() {
    redisConsumer.blpop("testList", "otherList", 0, function(err, res) {
        if (err) {
            console.log("ERROR: ");
            console.log(err);
        }
        else {
            console.log("Poped event: ");
            try {
                var job = JSON.parse(res[1]);

                console.log(job);

                playFile(job["fileLocation"], null, null, function() {

                    process.nextTick(waitOnData);
                });
            }
            catch (parseErro) {
                console.log("error when parsing");
                console.log(res);
                console.log(res[1]);
            }
        }
    });
}

waitOnData();

function postFile(fileLocation) {
    var redisProducer = redis.createClient();

    redisProducer.lpush("testList", JSON.stringify({
        'dat': 'keydddd',
        'fileLocation': fileLocation
    }), function(err, res) {
        if (err) {
            console.log("ERROR: ");
            console.log(err);
        }
        else {
            console.log("Added event: ");
            console.log(res);
        }
    });
}

var playFile = function(fileLocation, open, flush, close) {
    if (speakerAvailable) {
        speakerAvailable = false;
        fs.createReadStream(fileLocation).pipe(new lame.Decoder()).on('format', function(format) {
            var speaker = new Speaker(format);
            speaker.on('open', function() {
                console.log('on open');

            });
            speaker.on('flush', function() {
                console.log('on flush');
            });
            speaker.on('close', function() {
                console.log('on close');
                speakerAvailable = true;
                close();
            });
            this.pipe(speaker);
        });
    }
    else {
        console.log('Cannot play file, speaker not available!');
    }
}

exports.postFile = postFile;