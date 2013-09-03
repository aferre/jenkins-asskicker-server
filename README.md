jenkins-asskicker-server
========================

[![Build Status](https://travis-ci.org/aferre/jenkins-asskicker-server.png?branch=master)](https://travis-ci.org/aferre/jenkins-asskicker-server)
[![NPM version](https://badge.fury.io/js/jenkins-asskicker-server.png)](http://badge.fury.io/js/jenkins-asskicker-server)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/aferre/jenkins-asskicker-server/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

Node.js based sound server for kicking developers asses.

Install
-------

$ sudo apt-get install redis-server libasound2-dev libavahi-compat-libdnssd-dev
$ git clone https://github.com/aferre/jenkins-asskicker-server.git
$ cd jenkins-asskicker-server
$ npm install
$ node app.js

or using the npm modules in the npm registry

$ sudo apt-get install redis-server libasound2-dev
$ npm install -g jenkins-asskicker-server

Usage
-----

For now, you cannot do much... 

TODO
----

Add jenkins up/down support.

Add multiple langages support.

Provide route to upload custom mp3.

Added mongo/couch layer for persisting data.

Add per-job configuration.
