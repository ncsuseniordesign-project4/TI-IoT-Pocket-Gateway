#!/usr/bin/env node

/*
Following code sends the accelerometer readings to Azure IoT Device 
specified by the connection string variable

Created By: Janak Patel, April 2020
*/

// data from the accelerometer reading
var b = require('bonescript');
var XINPUT = '/sys/bus/iio/devices/iio:device1/in_accel_x_raw';
var YINPUT = '/sys/bus/iio/devices/iio:device1/in_accel_y_raw';
var ZINPUT = '/sys/bus/iio/devices/iio:device1/in_accel_z_raw';

// Azure IoT Device Objects
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;

// Connection String of IoT Device in the Azure IoT Hub
var connectionString = '[your-iot-device-primary-key-here]';

// creating client object 
var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

var xRead;
var yRead;
var zRead;

console.log('Hit ^C to stop');
doAccelRead();

function createJsonFormat(xR, yR, zR){
    var m = new Message(
        JSON.stringify(
            {
                x: xR.trim(),
                y: yR.trim(),
                z: zR.trim()
            }
        )
    );

    return m;
}

function doAccelRead() {
    // get the readings from the file
    xRead = b.readTextFile(XINPUT);
    yRead = b.readTextFile(YINPUT);
    zRead = b.readTextFile(ZINPUT);

    // print them to the console
    writeNum('x', xRead);
    writeNum('y', yRead);
    writeNum('z', zRead);
    process.stdout.write('\n');

    // convert data into JSON format before sending
    var message = createJsonFormat(xRead, yRead, zRead);

    // send the message to IoT Device
    client.sendEvent(message, function (err) {
        if (err) {
          console.error('send error: ' + err.toString());
        } else {
          console.log('message sent');
        }
    });

    // repeat the process after 750 ms
    setTimeout(doAccelRead, 750);
}

// Printing the data to console in nice format
function writeNum(axis, value) {
    value = "" + value.trim();
    while(value.length < 4) {
        value = " " + value;
    }
    process.stdout.write(axis + ': ' + value + '   ');
}
