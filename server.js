// Generated by CoffeeScript 1.7.1
(function() {
  var MongoWatch, apn, apnConnection, db, gcm, mongo, monk, options, sendAndroid, sendApple, testDevices, watcher;

  gcm = require("node-gcm");

  apn = require("apn");

  MongoWatch = require('mongo-watch');

  watcher = new MongoWatch;

  mongo = require('mongodb');

  monk = require('monk');

  db = monk('localhost:27017/deployd', {
    username: 'deployd',
    password: 'deployd'
  });

  testDevices = [];

  watcher.watch('deployd.quests', function(event) {
    var collection, devices, i, query, recipients, user, _results;
    devices = [];
    console.log(event.o.$set);
    recipients = event.o.$set.recipients;
    i = 0;
    _results = [];
    while (i < recipients.length) {
      user = recipients[i].user;
      query = {
        username: user
      };
      collection = db.get('users');
      collection.find(query, {}, function(e, docs) {
        if (docs) {
          devices.push(docs[0].device);
          sendApple(devices, "You have a new quest titled " + event.o.$set.title);
          return sendAndroid(devices, "You have a new quest titled " + event.o.$set.title, "New quest");
        }
      });
      _results.push(i++);
    }
    return _results;
  });

  watcher.watch('deployd.results', function(event) {
    var collection, creator, devices, query;
    devices = [];
    console.log(event);
    console.log(event.o.owner);
    creator = event.o.owner;
    query = {
      username: creator
    };
    collection = db.get('users');
    return collection.find(query, {}, function(e, docs) {
      if (docs) {
        devices.push(docs[0].device);
        sendApple(devices, "You have a new result from quest " + event.o.questtitle);
        return sendAndroid(devices, "You have a new result " + event.o.questtitle, "New result");
      }
    });
  });

  options = {
    gateway: "gateway.push.apple.com",
    passphrase: "1234"
  };

  apnConnection = new apn.Connection(options);

  sendApple = function(devices, text) {
    var apples, i, myDevice, note, x, _results;
    apples = [];
    i = 0;
    while (i < devices.length) {
      myDevice = new apn.Device(devices[i]);
      apples[i] = myDevice;
      i++;
    }
    note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 1;
    note.sound = "ping.aiff";
    note.alert = text;
    note.payload = {
      messageFrom: "Quest"
    };
    x = 0;
    _results = [];
    while (x < apples.length) {
      apnConnection.pushNotification(note, apples[x]);
      _results.push(x++);
    }
    return _results;
  };

  sendAndroid = function(devices, text, subj) {
    var i, message, registrationIds, sender;
    sender = new gcm.Sender("AIzaSyD-wjrqeMA3CHhJXTTGhl8CJH6hjACEJQE");
    registrationIds = [];
    message = new gcm.Message();
    message.addData("message", text);
    message.addData("title", subj);
    message.addData("msgcnt", "1");
    message.addData("soundname", "beep.wav");
    message.timeToLive = 3000;
    i = 0;
    while (i < devices.length) {
      registrationIds.push(devices[i]);
      i++;
    }
    return sender.send(message, registrationIds, 4, function(result) {
      console.log(result);
    });
  };

}).call(this);
