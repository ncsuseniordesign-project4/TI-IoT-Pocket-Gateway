/**
 * This following code simulates a pH sensor in an IoT network and sending data using XBee module 
 * via serial port.
 * 
 * TI IoT Pocket Gateway team at NC State University (ECE 484/485 - Senior Design)
 * 
 * @author Janak Patel
 */


var xbee_api = require('xbee-api');
var C = xbee_api.constants;
var SerialPort = require('serialport');
var receiverMacAddr = "";   // mac address of the XBee module to which the data needs to be sent
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout');

// xbeeApi object creation
var xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: 1,              // [1, 2]; 1 is default, 2 is with escaping (set ATAP=2)
    parser_buffer_size: 512,  // (int); size of the package parser buffer. 512 co
                              //   when receiving A LOT of packets, you might want to decrease 
                              //   this to a smaller value (but typically not less than 128)
    builder_buffer_size: 512  // (int); size of the package builder buffer. 
                              //   when sending A LOT of packets, you might want to decrease
                              //   this to a smaller value (but typically not less than 128)
});

// open a serial port connection with specified baud rate
var serialport = new SerialPort('/dev/ttyUSB0', {
    baudRate: 115200
});

// set the serial port parser
// The parser waits for 100 ms of silence after some data is received
// and then triggers the callback to ensure all the data is received 
// before parsing it.
const parser = serialport.pipe(new InterByteTimeout({interval: 100}));

// callback method for serial port error
serialport.on('error', function(err) {
    console.log('Error: ', err.message)
});

// callback method triggered when the parser received the complete message
parser.on('data', function (data) {
    
	try{
        var parsed = xbeeAPI.parseFrame(data);          // parse the raw data 
        
        // extract the actual message as a string and disregard the zigbee header data
        var parsedStringData = parsed.data.toString();  

        var jsonMsg = JSON.parse(parsedStringData);     // convert the string message to JSON format

        console.log("Received Command from ", jsonMsg.client, " :", jsonMsg.message);   // log the data to console

        // if the ph data was requested
        if (jsonMsg.message == "request_PH_data"){
            
            // generate a random ph reading between 6.00 and 7.00
            var phReading = 6.0 + (Math.floor(Math.random() * 100))/100;

            // construct the return message for the requesting device
            var message = {
                client: "XBee",
                topic: jsonMsg.client,
                message: "pH reading: " + phReading.toString()
            }

            var frame_obj = {
                type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST, // xbee_api.constants.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST
                destination64: receiverMacAddr,
                data: JSON.stringify(message)// Can either be string or byte array.
            };
            
            // write the message to serial port to send it
            serialport.write(xbeeAPI.buildFrame(frame_obj), function(){
                serialport.drain();
            });

            console.log ("Message Sent: ", message);    // log the message
        }
        else{
            console.log("Unknown Command Received");    // if any other command was received
        }
	}
	catch(e){
        // do nothing
	}
});

// callback method triggered when the serial port is opened successfully
serialport.on('open', function(){
    console.log("pH Sensor Ready"); // log the message to show the system is now ready
});