const chalk = require('chalk');

// Local MQTT network stuff
var mqtt = require('mqtt')
var localClient  = mqtt.connect('mqtt://localhost:1883')

// XBee Stuff
var receiverMacAddr = "0013A20040B7A99A";
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout');
var xbee_api = require('xbee-api');
var C = xbee_api.constants;
var xbeeAPI = new xbee_api.XBeeAPI({
    // default options:
    api_mode: 1,              // [1, 2]; 1 is default, 2 is with escaping (set ATAP=2)
    raw_frames: false,        // [true, false]; If set to true, only raw byte frames are
                              //   emitted (after validation) but not parsed to objects. 
    parser_buffer_size: 512,  // (int); size of the package parser buffer. 512 co
                              //   when receiving A LOT of packets, you might want to decrease 
                              //   this to a smaller value (but typically not less than 128)
    builder_buffer_size: 512  // (int); size of the package builder buffer. 
                              //   when sending A LOT of packets, you might want to decrease
                              //   this to a smaller value (but typically not less than 128)
});

// Serial port stuff

var SerialPort = require('serialport');

var serialport = new SerialPort('/dev/ttyUSB5', {
        baudRate: 115200
});

const parser = serialport.pipe(new InterByteTimeout({interval: 100}));

serialport.on('error', function(err) {
        console.log('Error: ', err.message)
});


parser.on('data', function (data) {
    
	try{
		//console.log('huh');
		var parsed = xbeeAPI.parseFrame(data);
		var parsedStringData = parsed.data.toString();
		var jsonMsg = JSON.parse(parsedStringData);
		console.log("XBee Data:", jsonMsg);
		if (jsonMsg.topic == "Cloud"){
				var newJsonMsg = {"client": "XBee", "message": jsonMsg.message};
				localClient.publish(jsonMsg.topic, JSON.stringify(newJsonMsg));
		}
		else{
				localClient.publish(jsonMsg.topic, jsonMsg.message);
		}
	}
	catch(e){
		//console.log("Error:", e);
	}
});



// Connection String of IoT Device in the Azure IoT Hub
var connectionString = 'HostName=sdFinalDemo.azure-devices.net;DeviceId=pocketBeagleGateway;SharedAccessKey=r8Ac2c5pKeq93Ei7rA0VzWcHKZRVyMoN3mYzaG+kQds=';

// Azure IoT Device Objects
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;

var azureClient = DeviceClient.fromConnectionString(connectionString, Mqtt);

// connect to broker and subscibe to the "cloud" topic
localClient.on('connect', function () {
        localClient.subscribe('Cloud', function (err) {
                if (err){
                        console.log("Error")
                }
                else {
                        console.log("Subscribed to \"Cloud\" topic")
                }
        })
        localClient.subscribe('XBee', function (err) {
                if (err){
                        console.log("Error")
                }
                else {
                        console.log("Subscribed to \"XBee\" topic")
                }
        })
})

// function invoked when broker relays a message from local device
localClient.on('message', function (topic, msg) {

        // convert the received message to JSON format and log it.
        var jsonMsg = JSON.parse(msg);
        console.log("Message from " + jsonMsg.client + ": " + jsonMsg.message);


    if (topic == "XBee"){
		try{

			var message = {
				client: jsonMsg.client,
				message: jsonMsg.message
            }

			var frame_obj = {
				type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST, // xbee_api.constants.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST
				destination64: receiverMacAddr,
				data: JSON.stringify(message) //JSON.stringify(message) // Can either be string or byte array.
			};
			
			serialport.write(xbeeAPI.buildFrame(frame_obj));
			//console.log(xbeeAPI.buildFrame(frame_obj));
			console.log ("Message Sent to XBee");
		}
		catch(e){
			//console.log("Error:", e);
		}
	}

	else if(topic == "Cloud"){
		// convert the JSON message to Azure message
		var azureMessage = new Message(JSON.stringify(jsonMsg));

		// send the message to the cloud
		azureClient.sendEvent(azureMessage, function (err) {
			if (err) {
				console.error('send error: ' + err.toString());
			} else {
				console.log('Message sent to Azure IoT Hub');
			}
		});
	}
})

// when a message arrives from the cloud
azureClient.onDeviceMethod('sendMessageToLocalDevice', function(request, response){

	// log message in green color
	console.log(chalk.green('Message received from Azure IoT Hub'));

	// send the message to the local device
	var jsonMsg = request.payload;
	if (jsonMsg.client != "XBee"){
		localClient.publish(jsonMsg.client, jsonMsg.message);
	}
	else{
		try{

			var message = {
				client: "Cloud",
				message: jsonMsg.message
            }

			var frame_obj = {
				type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST, // xbee_api.constants.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST
				destination64: receiverMacAddr,
				data: JSON.stringify(message) //JSON.stringify(message) // Can either be string or byte array.
			};
			
			serialport.write(xbeeAPI.buildFrame(frame_obj));
			//console.log(xbeeAPI.buildFrame(frame_obj));
			//console.log ("Message Sent to XBee");
		}
		catch(e){
			//console.log("Error:", e);
		}
	}

	// log message sent
	console.log(chalk.green('Message sent to ' + jsonMsg.client));

	var responsePayload = {
		success: 'true',
		payload: 'Successfully sent the to ' + jsonMsg.client
	};

	response.send(200, responsePayload);

})
