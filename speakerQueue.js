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

                if (job.fileLocation) {
                    playFile(job.fileLocation, null, null, function() {
                        process.nextTick(waitOnData);
                    });
                }
                else if (job.uuid) {
                    playFileRedis(job.uuid, null, null, function() {
                        process.nextTick(waitOnData);
                    });
                }
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

function postRedis(key) {
    var redisProducer = redis.createClient();

    redisProducer.get(key, function(err, res) {
        if (err) {
            console.log("ERROR: ");
            console.log(err);
        }
        else {
            console.log("Retrieved data using redis for " + key);

            redisProducer.lpush("testList", JSON.stringify({
                'uuid': key
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
    });
}

var playFileRedis = function(uuid, open, flush, close) {
    if (speakerAvailable) {
        speakerAvailable = false;

        var redisProducer = redis.createClient(null, null, {
            return_buffers: true
        });
        try {
            redisProducer.get(uuid, function(err, res) {
                if (err) {
                    console.log("ERROR: ");
                    console.log(err);
                }
                else {
                    console.log("Retrieved data to play using redis, uuid is " + uuid);

                    var buffer = new Buffer(res, "binary");

                    console.log(buffer);

                    fs.writeFile("/tmp/mp3files/" + uuid + ".mp3", buffer, function(err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("The file was saved!");
                            playFile("/tmp/mp3files/" + uuid + ".mp3", null, null, close, true);
                        }
                    });
                }
            });
        }
        catch (err) {
            console.log(err);
        }
    }
    else {
        console.log('Cannot play file, speaker not available!');
    }
};

var playFile = function(fileLocation, open, flush, close, force) {
    if (force || speakerAvailable) {
        speakerAvailable = false;
        fs.createReadStream(fileLocation).pipe(new lame.Decoder()).on('format', function(format) {
            var speaker = new Speaker(format);
            speaker.on('open', function() {
                console.log('on open');
                if (open) open();
            });
            speaker.on('flush', function() {
                console.log('on flush');
                if (flush) flush();
            });
            speaker.on('close', function() {
                console.log('on close');
                speakerAvailable = true;
                if (close) close();
            });
            this.pipe(speaker);
        });
    }
    else {
        console.log('Cannot play file, speaker not available!');
    }
}

exports.postFile = postFile;
exports.postRedis = postRedis;