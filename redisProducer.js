
var redis = require("redis"), jsonify = require('redis-jsonify');
var redisProducer = redis.createClient();
redisProducer.on('connect',function(){
	console.log("CONNECTED: ");	
});
redisProducer.on('ready',function(){
	console.log("READY: ");	
});
redisProducer.on('end',function(){
	console.log("ENDED: ");	
});


redisProducer.lpush("testList",JSON.stringify({'data':'keydddd'}),function (err, res) {
	if (err){
		console.log("ERROR: ");
		console.log(err);			
	}else{
		console.log("Added event: ");
		console.log(res);
	}}); 
redisProducer.lpush("testList",JSON.stringify({'data1':'keydddd'}),function (err, res) {
	if (err){
		console.log("ERROR: ");
		console.log(err);			
	}else{
		console.log("Added event: ");
		console.log(res);
	}
}); 
redisProducer.lpush("testList",JSON.stringify({'data2':'keydddd'}),function (err, res) {
	if (err){
		console.log("ERROR: ");
		console.log(err);			
	}else{
		console.log("Added event: ");
		console.log(res);
	}
}); 
