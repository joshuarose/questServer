gcm = require("node-gcm")
apn = require("apn")
MongoWatch = require 'mongo-watch'
watcher = new MongoWatch
mongo = require 'mongodb'
monk = require 'monk'
db = monk 'localhost:27017/deployd', { username : 'deployd', password : 'deployd'}

testDevices = []



watcher.watch 'deployd.quests', (event) ->
	devices = []
	console.log event.data.questtitle
	recipients = event.data.recipients
	i = 0
	while i < recipients.length
		user = recipients[i].user
		query = {username : user}
		collection = db.get 'users'
		collection.find query,{}, (e,docs) ->
			if docs
				devices.push docs[0].device
				sendApple(devices, "You have a new quest titled #{event.data.questtitle}")
				sendAndroid(devices, "You have a new quest titled #{event.data.questtitle}", "New quest")
		i++


watcher.watch 'deployd.results', (event) ->
	devices = []
	console.log event.data.owner
	creator = event.data.owner
	query = {username : creator}
	collection = db.get 'users'
	collection.find query,{}, (e,docs) ->
		if docs
			devices.push docs[0].device
			sendApple(devices, "You have a new result from quest #{event.data.questtitle}")
			sendAndroid(devices, "You have a new result #{event.data.questtitle}", "New result")

options =
  gateway: "gateway.push.apple.com"
  passphrase: "1234"
apnConnection = new apn.Connection(options)

sendApple = (devices, text) ->
	apples = []
	i = 0
	while i < devices.length
	  myDevice = new apn.Device(devices[i])
	  apples[i] = myDevice
	  i++
	note = new apn.Notification()
	note.expiry = Math.floor(Date.now() / 1000) + 3600 # Expires 1 hour from now.
	note.badge = 1
	note.sound = "ping.aiff"
	note.alert = text
	note.payload = messageFrom: "Quest"
	x = 0
	while x < apples.length
	  apnConnection.pushNotification note, apples[x]
	  x++


sendAndroid = (devices, text, subj) ->
	sender = new gcm.Sender("AIzaSyD-wjrqeMA3CHhJXTTGhl8CJH6hjACEJQE")
	registrationIds = []
	message = new gcm.Message()
	message.addData "message", text
	message.addData "title", subj
	message.addData "msgcnt", "1" # Shows up in the notification in the status bar
	message.addData "soundname", "beep.wav" #Sound to play upon notification receipt - put in the www folder in app
	message.timeToLive = 3000 # Duration in seconds to hold in GCM and retry before timing out. Default 4 weeks (2,419,200 seconds) if not specified.

	# At least one reg id required
	i = 0
	while i < devices.length
	  registrationIds.push devices[i]
	  i++

	sender.send message, registrationIds, 4, (result) ->
	  console.log result
	  return

