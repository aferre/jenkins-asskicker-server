
var redis = require("redis");
var redisConsumer = redis.createClient();
var redisProducer = redis.createClient();
redisConsumer.on('connect',function(){

		console.log("CONNECTED: ");	
});redisConsumer.on('ready',function(){

		console.log("READY: ");	
		
	

});
redisConsumer.on('end',function(){

		console.log("ENDED: ");	
});

var sl = require('sleep');

waitOnData();
redisProducer.lpush("testList",JSON.stringify({'dat':'keydddd'}),function (err, res) {
	if (err){
		console.log("ERROR: ");
		console.log(err);			
	}else{
		console.log("Added event: ");
		console.log(res);
	}
}); 
function waitOnData(){
	redisConsumer.blpop("testList", "otherList", 0, function (err, res) {
			if (err){
				console.log("ERROR: ");
				console.log(err);			
			}else{
				console.log("Poped event: ");
				try {
					console.log(JSON.parse(res[1]));
				}catch(parseErro){
					console.log("error when parsing");
					console.log(res);
					console.log(res[1]);
				}
			}
			sl.sleep(2);
			process.nextTick(waitOnData);
		});
}
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
