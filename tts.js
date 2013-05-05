var http = require('http');
var url = require('url');
var jsonify = require('redis-jsonify');
var redis = require('redis');
var ttsData = redis.createClient();
var redisProducer = redis.createClient();

var CACHE = true;

redisProducer.on('connect', function() {
    console.log("CONNECTED: ");
});

redisProducer.on('ready', function() {
    console.log("READY: ");
});

redisProducer.on('end', function() {
    console.log("ENDED: ");
});

function requestData(text, lang, done, error) {

    var ur = url.parse("translate.google.com/translate_tts", true);
    ur.query = {
        'tl': 'fr',
        'q': text
    };
    var formated = url.parse(url.format(ur), true);
    console.log(formated.path);

    var options = {
        host: 'translate.google.com',
        path: formated.path,
        headers: {
            'user-agent': 'Mozilla/5.0'
        }
    };

    var req = http.request(options, function(res) {
        var data = [];
        var chunks = 0;

        res.on('data', function(chunk) {
            chunks++;
            data.push(chunk);
        }).on('end', function() {

            console.log('Retrieved ' + chunks + ' chunks.');

            var buffer = Buffer.concat(data);

            if (buffer.length === 0) {
                console.log("Retrieved empty data!");
                error();
            }
            else {

                if (CACHE) {
                    var key = "audio";

                    var rcli = redis.createClient();

                    //redis gives a value to error and exists                                                                                                                                                                                          
                    rcli.exists(key + ':uuid', function(error, exists) {
                        //if error is defined, then there was probably some
                        //problem connecting to redis
                        if (error) {
                            console.log('ERROR: ' + error);
                        }
                        //otherwise exists will be available, and we can do something with it
                        else if (!exists) {
                            rcli.set(key + ':uuid', 0); //create the awesome key
                        }
                    });

                    console.log("Persisting audio data for " + text);

                    rcli.incr(key + ':uuid', function(err, uuid) {

                        if (err) {
                            console.log(err);
                            error(err);
                        }
                        else {
                            console.log("Using " + uuid + " as uuid for " + text);

                            var bufferBinary = new Buffer(buffer, 'binary');
                            rcli.set(key + ":data:tts:" + uuid, bufferBinary, redis.print);

                            rcli.hset(key + ":list", uuid, JSON.stringify({
                                'lang': lang,
                                'text': text,
                                'url': formated
                            }), redis.print);

                            rcli.hset(key + ":textList", text, uuid, redis.print);
                            rcli.quit();
                            done(null, uuid);
                        }

                    });

                }
                else {
                    done(buffer);
                }

            }
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        error(e);
    });

    req.end();
}

var retrieve = function(text, lang, retrievedTTScallback, onError) {

    console.log(text);

    if (CACHE) {

        redisProducer.hexists("audio:textList", text, function(err, reply) {
            if (err) {
                console.log("ERROR is " + err);
            }
            else if (reply) {
                console.log("Does exists ( " + text + " )");
                redisProducer.hget("audio:textList", text, function(err, reply) {
                    if (err) {
                        console.log("ERROR is " + err);
                    }
                    else if (reply) {
                        console.log("Res is " + reply);
                        retrievedTTScallback(text, lang, null, reply);
                    }
                });
            }
            else {
                requestData(text, lang, function(data, uuid) {
                    retrievedTTScallback(text, lang, data, uuid);
                },
                onError);
            }
        });
    }
    else {

        requestData(text, lang, function(data, uuid) {
            retrievedTTScallback(text, lang, data, uuid);
        },
        onError);

    }

};
exports.retrieve = retrieve;