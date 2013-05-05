var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');

fs.createReadStream("/tmp/test.mp3")
 				.pipe(new lame.Decoder())
  				.on('format', function (format) {
    					this.pipe(new Speaker(format));
  				}); 
