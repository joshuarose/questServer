var gcm = require('node-gcm');
var apn = require('apn');
var message = new gcm.Message();
var devices = [];
var apples = [];

var device = "ec3ff08e587ae5e0d9780184334e7ab632fcae8c7178df2d5d2e860d966dcdfc";
var device2 = "12312423452345";

devices.push(device, device2);
 
 //GCM logic
// //API Server Key
var sender = new gcm.Sender(device);
var registrationIds = [];

var options = { "gateway": "gateway.push.apple.com", "passphrase" : "1234" };

var apnConnection = new apn.Connection(options);
 
for (var i = 0; i < devices.length; i++){
	var myDevice = new apn.Device(device);
	apples[i] = myDevice;
}

var note = new apn.Notification();

note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
note.badge = 3;
note.sound = "ping.aiff";
note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
note.payload = {'messageFrom': 'Caroline'};

for (var x = 0; x < apples.length; x++){
	apnConnection.pushNotification(note, apples[x]);
}


// GCM logic
// Value the payload data to send...
message.addData('message',"\u270C Peace, Love \u2764 and PhoneGap \u2706!");
message.addData('title','Push Notification Sample' );
message.addData('msgcnt','3'); // Shows up in the notification in the status bar
message.addData('soundname','beep.wav'); //Sound to play upon notification receipt - put in the www folder in app
//message.collapseKey = 'demo';
//message.delayWhileIdle = true; //Default is false
message.timeToLive = 3000;// Duration in seconds to hold in GCM and retry before timing out. Default 4 weeks (2,419,200 seconds) if not specified.
 
// At least one reg id required
registrationIds.push(device);
 
/**
 * Parameters: message-literal, registrationIds-array, No. of retries, callback-function
 */
sender.send(message, registrationIds, 4, function (result) {
    console.log(result);
});