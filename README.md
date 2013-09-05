jenkins-asskicker-server
========================

[![Build Status](https://travis-ci.org/aferre/jenkins-asskicker-server.png?branch=master)](https://travis-ci.org/aferre/jenkins-asskicker-server)
[![NPM version](https://badge.fury.io/js/jenkins-asskicker-server.png)](http://badge.fury.io/js/jenkins-asskicker-server)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/aferre/jenkins-asskicker-server/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

Node.js based sound server for kicking developers asses.

Install
-------

    sudo apt-get install redis-server libasound2-dev libavahi-compat-libdnssd-dev
    git clone https://github.com/aferre/jenkins-asskicker-server.git
    cd jenkins-asskicker-server
    npm install
    node app.js

or using the npm modules in the npm registry

    sudo apt-get install redis-server libasound2-dev
    npm install -g jenkins-asskicker-server
    jenkins-asskicker-server

Usage
-----

The jenkins instances will be automagically discovered on the local network using either mdns or udp broadcasting. 
Both of these are provided in Jenkins out-of-the-box. Once jenkins instances are discovered (and they are up), 
all jobs will be monitored using either udp (install jenkins plugin https://wiki.jenkins-ci.org/display/JENKINS/Notification+Plugin 
and see the configuration section below) or websocket (install jenkins plugin 
https://wiki.jenkins-ci.org/display/JENKINS/Websocket+Plugin and see the configuration section below).


Configuration
-------------

- redis: 
  - host:
  - port:

- jenkins:
  - websocket:
    - port:
	- udp:
		- port:
		- interval:
		- consideredDownInterval:
	- notifyUponRestart:

- desc:
	- location:
	- users:

TODO
----

Add multiple langages support.

Provide route to upload custom mp3.

Added mongo/couch layer for persisting data.

Add per-job configuration.
