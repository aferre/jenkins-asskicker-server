var fs    = require('fs'),
      nconf = require('nconf');
 nconf.argv().env()
       .file({ file: 'dictionary.json' });

  nconf.set('greetings:polite', 'Hi how are you?');
  nconf.set('greetings:familiar', 'What\'up?');
  nconf.set('failure:polite', 'build failed.');
  nconf.set('failure:familiar', 'what the fuck.');
 
  nconf.save(function (err) {
    fs.readFile('dictionary.json', function (err, data) {
      console.dir(JSON.parse(data.toString()));
    });
  });