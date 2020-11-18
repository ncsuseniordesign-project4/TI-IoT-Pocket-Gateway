#!/usr/bin/env node
////////////////////////////////////////
// Simple script for polling button GPIO
// states and toggling LED GPIO states.
////////////////////////////////////////
const b = require('bonescript');

const ledPin1 = "P2_6";
const ledPin2 = "P2_8";
const ledPin3 = "P2_10";

const mydelay = 250;
var state1 = b.LOW;
var state2 = b.HIGH;
var state3 = b.LOW;

var btnOn = '/sys/class/gpio/gpio65/value'
var btnOff = '/sys/class/gpio/gpio27/value'

setOutput(ledPin1);
setOutput(ledPin2);
setOutput(ledPin3);

toggle();

// Sets provided ledPin to output
function setOutput(ledPin) {
    b.pinMode(ledPin, b.OUTPUT);
    setLED(ledPin, b.LOW);
}

// Sets the provided ledPin to the provided state
function setLED(ledPin, x) {
    b.digitalWrite(ledPin, x);
}

// Main button polling and LED toggle loop
function toggle() {
    var onState = b.readTextFile(btnOn)
    var offState = b.readTextFile(btnOff);
    
    if (onState == 1)
    {
        state1 = b.HIGH;
        state2 = b.LOW;
        state3 = b.HIGH;
    }
    
    if (offState == 1) {
        state1 = b.LOW;
        state2 = b.HIGH;
        state3 = b.LOW;
    }
    
    setLED(ledPin1, state1);
    setLED(ledPin2, state2);
    setLED(ledPin3, state3);
    setTimeout(toggle, mydelay);
}
