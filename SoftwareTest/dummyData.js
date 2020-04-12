/*
Following code sends the dummy data readings to Azure IoT Device 
specified by the connection string variable

The dummmy data is just a number which is incremented by 1 and then sent
at every 2 second interval

Created By: Janak Patel, April 2020
*/ 

// Connection String of IoT Device in the Azure IoT Hub
var connectionString = '[your-iot-device-primary-key-here]';

// Azure IoT Device Objects
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;

// number that will be incremented and sent
var num = 0;

// set up a client object
var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

function sendMessage(){

    // construct the message in JSON format for Stream Analytics Query
    // to easily filter
    var message = new Message(
      JSON.stringify(
        {
            value: num  
        }
      )
    );

    // log the message to console
    console.log('Sending Message: ' + message.getData());
    num = num + 1;  // increment the number

    // send the message 
    client.sendEvent(message, function (err) {
        if (err) {
          console.error('send error: ' + err.toString());
        } else {
          console.log('message sent');
        }
    });
}

// repeat the process every 2 seconds (2000 ms)
setInterval(sendMessage, 2000);
