
console.log('Starting monitor...');

var request = require('request');
var fs = require('fs');

var requestOptions = {
    url: 'https://prairielearn2.engr.illinois.edu:/questions/Cart2Polar/2342/client.js',
    timeout: 10000
};

var testInterval = 60 * 1000; // ms
var nFailuresBeforeSend = 2;
var errorRateLimit = 10 * 60 * 1000; // ms
var heartbeatHourOfDay = 9;
var heartbeatRateLimit = 12 * 60 * 60 * 1000; // ms

var nCurrentFails = 0;
var errorLastTime = 0;
var heartbeatLastTime = 0;

var config = {};

// Twilio Credentials 
config.accountSid = 'FILL_IN_THIS_ACCOUNT_SID'; // override in config.json
config.authToken = 'FILL_IN_THIS_AUTH_TOKEN';
config.toNumber = "+19998887777";
config.fromNumber = "+12223334444";

if (fs.existsSync('config.json')) {
    try {
        fileConfig = JSON.parse(fs.readFileSync('config.json', {encoding: 'utf8'}));
        _.defaults(fileConfig, config);
        config = fileConfig;
    } catch (e) {
        console.log("Error reading config.json:", e);
        process.exit(1);
    }
} else {
    console.log("config.json not found, using default configuration...");
}

//require the Twilio module and create a REST client
var twilioClient = require('twilio')(accountSid, authToken);

var sendSMS = function(msg, callback) {
    console.log("Sending SMS:", msg);
    twilioClient.messages.create({
	to: config.toNumber,
	from: config.fromNumber,
	body: msg,
    }, function(err, message) {
        if (err) {
	    console.log("Error sending SMS", err, message);
        } else {
            console.log("Successfully sent SMS");
            callback();
        }
    });
};

var doTest = function() {
    request(requestOptions, function(error, response, body) {
        // heartbeat
        if ((new Date()).getHours() === heartbeatHourOfDay)
            if (Date.now() - heartbeatLastTime > heartbeatRateLimit)
                sendSMS("heartbeat", function() {
                    heartbeatLastTime = Date.now();
                });

        // monitor
        var msg = null;
        if (!error && response.statusCode === 200) {
            if (!/SimpleClient/.test(body))
                msg = "incorrect body";
        } else {
            msg = (error ? error : ("statusCode = " + response.statusCode));
        }

        // no error
        if (msg === null) {
            console.log((new Date()).toISOString(), "ok");
            nCurrentFails = 0;
            return;
        }

        // error detected
        nCurrentFails++;
        console.log((new Date()).toISOString(), "error", msg, nCurrentFails);
        if (nCurrentFails >= nFailuresBeforeSend) {
            if (Date.now() - errorLastTime > errorRateLimit) {
                sendSMS("error: " + msg, function() {
                    errorLastTime = Date.now();
                });
            } else {
                console.log((new Date()).toISOString(), "SMS rate limit exceeded, no further action");
            }
        } else {
            console.log((new Date()).toISOString(), "number of successive failures " + nCurrentFails + " is less than " + nFailuresBeforeSend + ", no futher action");
        }
    });
};

doTest();
setInterval(doTest, testInterval);
