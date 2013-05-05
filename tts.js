var http = require('http');
var url = require('url');
var jsonify = require('redis-jsonify');
var redis = require('redis');
var ttsData = redis.createClient();
var redisProducer = redis.createClient();

var CACHE = false;

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

                console.log("Persisting data");
                redisProducer.lpush("ttsList", JSON.stringify({
                    'lang': lang,
                    'text': text
                }), redis.print);
                
                var obj = [];
                
                obj.text = text;
                obj.data = data;
                
                redisProducer.lpush("ttsData", obj, redis.print);
                    
                redisProducer.keys( '*' , redis.print);
                done(buffer);
            }
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        error();
    });

    req.end();
}

var retrieve = function(text, lang, retrievedTTScallback, onError) {

    console.log(text);

    if (CACHE) {
        var found = false;
        if (found) {

        }
        else {
            requestData(text, lang, function(data) {
                retrievedTTScallback(text, lang, data);
            },
            onError);
        }
    }
    else {
        requestData(text, lang, function(data) {
            retrievedTTScallback(text, lang, data);
        },
        onError);
    }

}

exports.retrieve = retrieve;