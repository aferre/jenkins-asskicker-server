var fs    = require('fs'),
      nconf = require('nconf');

  //
  // Setup nconf to use (in-order):
  //   1. Command-line arguments
  //   2. Environment variables
  //   3. A file located at 'path/to/config.json'
  //
  nconf.argv()
       .env()
       .file({ file: 'config.json' });

  //
  // Set a few variables on `nconf`.
  //
  nconf.set('jenkins:websocket:port', 10000);
  nconf.set('redis:host', '127.0.0.1');
  nconf.set('redis:port', 5984);

  //
  // Get the entire database object from nconf. This will output
  // { host: '127.0.0.1', port: 5984 }
  //
  console.log('jenkins:websocket:port: ' + nconf.get('jenkins:websocket:port'));
  console.log('redis:host: ' + nconf.get('redis:host'));
  console.log('redis:port: ' + nconf.get('redis:port'));

  //
  // Save the configuration object to disk
  //
  nconf.save(function (err) {
    fs.readFile('config.json', function (err, data) {
      console.dir(JSON.parse(data.toString()));
    });
  });