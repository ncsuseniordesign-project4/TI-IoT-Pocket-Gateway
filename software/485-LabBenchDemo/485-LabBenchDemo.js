#!/usr/bin/env node

/*
Following code accepts messages sent from the Azure IoT Hub specified by the
connection string variable.

Based off of 'receive_c2d.js' and 'receive_methods.js' in the
'azure-iot-samples-node' repo:
https://github.com/Azure-Samples/azure-iot-samples-node/blob/96179d0263fc827a1d337ebd878a791559d6190e/iot-hub/Samples/device/receive_c2d.js
https://github.com/Azure-Samples/azure-iot-samples-node/blob/96179d0263fc827a1d337ebd878a791559d6190e/iot-hub/Samples/device/receive_methods.js

Authored-by: Microsoft
Authored-by: Liza Chevalier
*/

'use strict';

// Setup and config
var boneScript = require('bonescript');
const { networkInterfaces } = require('os');
var config = JSON.parse(boneScript.readTextFile('/etc/485-LabBenchDemo.conf'));

// RGB LED access
var LED_GREEN = '/sys/class/leds/techlab::green/brightness';
var LED_BLUE = '/sys/class/leds/techlab::blue/brightness';

boneScript.writeTextFile(LED_GREEN, 0);
boneScript.writeTextFile(LED_BLUE, 0);

// Connection String of IoT Device in the Azure IoT Hub
var connectionString = config.secretKey;

// Azure IoT Device Objects
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;

// creating client object
var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

client.open(function (err) {
    if (err) {
        console.error(err.toString());
        process.exit(-1);
    } else {
        console.log('client successfully connected');

        // Subscribing to the message event will automatically subscribe to the appropriate topic in MQTT, establish links in AMQP,
        // or start a timer to receive at specific intervals in HTTP.
        // The HTTP behavior can be customized with a call to `Client.setOptions`.
        client.on('message', function (msg) {
            console.log('-- BEGIN MESSAGE TO ' + msg.messageId + ' --');
            console.log(msg.data.toString());
            console.log('-- END MESSAGE --');

            client.complete(msg, function (err) {
                if (err) {
                    client.error('could not settle message: ' + err.toString());
                } else {
                    console.log('message successfully accepted');
                }
                console.log('now listening for messages / method calls...');
            });
            // The AMQP and HTTP transports also have the notion of completing, rejecting or abandoning the message.
            // When completing a message, the service that sent the C2D message is notified that the message has been processed.
            // When rejecting a message, the service that sent the C2D message is notified that the message won't be processed by the device. the method to use is client.reject(msg, callback).
            // When abandoning the message, IoT Hub will immediately try to resend it. The method to use is client.abandon(msg, callback).
            // MQTT is simpler: it accepts the message by default, and doesn't support rejecting or abandoning a message.
        });

        client.on('error', function (err) {
            console.error(err.message);
        });

        // register handler for 'updateGreenLED'
        client.onDeviceMethod('updateGreenLED', function (request, response) {
            console.log('received a request for updateGreenLED');
            console.log(JSON.stringify(request.payload, null, 2));

            var ledSetting = request.payload;

            if (ledSetting.brightness >= 0) {
                console.log('Setting Green LED brightness to: ' + ledSetting.brightness);
                boneScript.writeTextFile(LED_GREEN, ledSetting.brightness);
                var responsePayload = {
                    success: 'true',
                    payload: 'Green LED brightness set to ' + ledSetting.brightness + ' successfully'
                };
            } else {
                console.log('Method payload incorrect, LED brightness missing');
                responsePayload = {
                    success: 'false',
                    payload: 'Green LED brightness missing in method call!'
                };
            }

            response.send(200, responsePayload, function (err) {
                if (err) {
                    console.error('Unable to send method response: ' + err.toString());
                } else {
                    console.log('response to updateGreenLED sent.');
                }
                console.log('now listening for messages / method calls...');
            });
        });

        // register handler for 'updateBlueLED'
        client.onDeviceMethod('updateBlueLED', function (request, response) {
            console.log('received a request for updateBlueLED');
            console.log(JSON.stringify(request.payload, null, 2));

            var ledSetting = request.payload;

            if (ledSetting.brightness >= 0) {
                console.log('Setting Blue LED brightness to: ' + ledSetting.brightness);
                boneScript.writeTextFile(LED_BLUE, ledSetting.brightness);
                var responsePayload = {
                    success: 'true',
                    payload: 'Blue LED brightness set to ' + ledSetting.brightness + ' successfully'
                };
            } else {
                console.log('Method payload incorrect, LED brightness missing');
                responsePayload = {
                    success: 'false',
                    payload: 'Blue LED brightness missing in method call!'
                };
            }

            response.send(200, responsePayload, function (err) {
                if (err) {
                    console.error('Unable to send method response: ' + err.toString());
                } else {
                    console.log('response to updateBlueLED sent.');
                }
                console.log('now listening for messages / method calls...');
            });
        });

        // register handler for 'getNetworkStatus'
        client.onDeviceMethod('getNetworkStatus', function (request, response) {
            console.log('received a request for getNetworkStatus');
            console.log(JSON.stringify(request.payload, null, 2));

            const nets = networkInterfaces();
            const responsePayload = {};

            for (const name of Object.keys(nets)) {
                for (const net of nets[name]) {
                    if (net.family === 'IPv4' && !net.internal) {
                        if (!responsePayload[name]) {
                            responsePayload[name] = [];
                        }

                        responsePayload[name].push(net.address);
                    }
                }
            }

            response.send(200, responsePayload, function (err) {
                if (err) {
                    console.error('Unable to send method response: ' + err.toString());
                } else {
                    console.log('response to getNetworkStatus sent.');
                }
                console.log('now listening for messages / method calls...');
            });
        });

        console.log('now listening for messages / method calls...');
    }
});
