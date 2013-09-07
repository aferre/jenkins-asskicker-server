/* jslint node: true */
"use strict";
var mdns = require('mdns');
var opts;

var start = function(options) {
    opts = options;
};

function handleAdvertisementError(error) {
    switch (error.errorCode) {
    case mdns.kDNSServiceErr_Unknown:
        console.warn(error);
        setTimeout(advertise, 5000);
        break;
    default:
        throw error;
    }
}

function advertise() {
    try {
        var txt_record = {};
        txt_record.location = opts.location;
        txt_record.users = JSON.stringify(opts.users);
        var ad = mdns.createAdvertisement(mdns.tcp('kicker-jenkins'), 4321, {
            txtRecord: txt_record,
            networkInterface: "eth2"
        });
        ad.on('error', handleAdvertisementError);
        ad.start();
    }
    catch (ex) {
        handleAdvertisementError(ex);
    }
}


var browser = mdns.createBrowser(mdns.tcp('jenkins-kicker'));

browser.on('serviceUp', function(service) {
    //    console.log("service up: ", service);

    //  console.log("service up: ", JSON.parse(service.txtRecord.users));
});

browser.on('serviceDown', function(service) {
    //console.log("service down: ", service);
});

browser.start();

exports.start=start;