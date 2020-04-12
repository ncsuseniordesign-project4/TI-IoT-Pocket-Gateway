#!/usr/bin/env node

/*
Following code sends the accelerometer readings to Azure IoT Device 
specified by the connection string variable.

Based off of 'accel2LED.js' written for the TechLab cape:
https://github.com/beagleboard/cloud9-examples/blob/1f102b6aa4aab79bf0dd058e90c8e66c5224687d/PocketBeagle/TechLab/.challenges/accel2LED.js

Authored-by: Jason Kridner (jadonk)
Modified-by: Janak Patel
Modified-by: Liza Chevalier
*/

// Setup and config
var boneScript = require('bonescript');
var config = JSON.parse(boneScript.readTextFile('/etc/484-TechDemo.conf'));

// Connection String of IoT Device in the Azure IoT Hub
var connectionString = config.secretKey;
// Delay, in milliseconds, between program loop iterations
var readDelay = config.readDelay;

// Accelerometer Inputs
var XINPUT = '/sys/bus/iio/devices/iio:device1/in_accel_x_raw';
var YINPUT = '/sys/bus/iio/devices/iio:device1/in_accel_y_raw';
var ZINPUT = '/sys/bus/iio/devices/iio:device1/in_accel_z_raw';

// RGB LED outputs
var XOUTPUT = '/sys/class/leds/techlab::red/brightness';
var YOUTPUT = '/sys/class/leds/techlab::green/brightness';
var ZOUTPUT = '/sys/class/leds/techlab::blue/brightness';

// Azure IoT Device Objects
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;

// creating client object 
var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

boneScript.writeTextFile('/sys/devices/platform/ocp/ocp\:P1_33_pinmux/state', 'pwm');

console.log('Hit ^C to stop');
doAccelRead();

function createJsonFormat(xRead, yRead, zRead){
    return new Message(
        JSON.stringify(
            {
                x: xRead,
                y: yRead,
                z: zRead
            }
        )
    );
}

function doAccelRead() {
    // get the readings from the file
    var xRead = boneScript.abs(boneScript.readTextFile(XINPUT).trim());
    var yRead = boneScript.abs(boneScript.readTextFile(YINPUT).trim());
    var zRead = boneScript.abs(boneScript.readTextFile(ZINPUT).trim());

    // write them to the RGB LEB
    boneScript.writeTextFile(XOUTPUT, xRead);
    boneScript.writeTextFile(YOUTPUT, yRead);
    boneScript.writeTextFile(ZOUTPUT, zRead);

    sendAzureMessage(xRead, yRead, zRead);

    setTimeout(doAccelRead, readDelay);
}

// Creates a message and sends it to Azure
function sendAzureMessage(xRead, yRead, zRead) {
    // convert data into JSON format before sending
    var message = createJsonFormat(xRead, yRead, zRead);

    // send the message to IoT Device
    client.sendEvent(message, function (err) {
        if (err) {
            console.error('send error: ' + err.toString());
        } else {
            console.log('message sent: ' + message.data + '\n');
        }
    });
}
