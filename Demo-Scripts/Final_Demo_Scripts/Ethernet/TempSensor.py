#!/usr/bin/python3

# ------------------------------------------------------------------------------------------------------------
# The following code simulates a temperature sensor and sends the messages to broker on a specified topic while 
# waiting listening for messages on a subscribed topic.

# Publisher: TI IoT Pocket Gateway team at NC State University (ECE 484/485 - Senior Design)
# Year:      2020
# Author:    Janak Patel
# ------------------------------------------------------------------------------------------------------------


import paho.mqtt.client as mqtt
import time
import json
from random import random
from random import randrange


broker = "10.10.40.10"  # IP address of the broker
subTopic = "RPi"        # Message topic this device is interested in
pubTopic = "Cloud"      # Topic on which this device publishes the message on
turnOFFResponse = json.dumps({ "client": subTopic, "message": " Temperature reading turned OFF" })
turnONResponse = json.dumps({ "client": subTopic, "message": "Temperature reading turned ON" })
unknownCommand = json.dumps({ "client": subTopic, "message": "Received an unknown command! No changes made" })
send = False            # don't send messages on startup, wait until the turnON message arrives

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    global  send
    recMessage = (str(msg.payload.decode("utf-8"))) # decode the received message
   
    if (recMessage == "turnOFF"):
        send = False
        print("Temperature sensor stream turned off")
        client.publish(pubTopic, turnOFFResponse)   # send the success message back
    
    elif (recMessage == "turnON"):
        send = True
        print("Temperature sensor stream turned on")
        client.publish(pubTopic, turnONResponse)   # send the success message back     
    
    else:
        print("Unknown command received! No changes made")
        client.publish(pubTopic, unknownCommand)    # send the message back

# Function to generate simulated humidity reading between 60 and 80
def generateTemperatureReading():
    return randrange(65, 75) + random()



client = mqtt.Client() # mqtt client object creation

client.loop_start()    # callback methods get triggered within the loop section only
 
client.on_message = on_message      # set the callback method
client.connect(broker)              # connect to broker on the set ip
client.subscribe(subTopic)          # subscribe to topic which the device wants to recevie messages about
print("Subscribed to " + pubTopic + " topic")   # print to console about the sub topic success

client.loop_stop()    # end of the client loop

print("Temperature sensor stream status: OFF")

# Send humidity messages on a 3 second interval if the stream is ON
while True:
    client.loop_start()
   
    if (send):          # if the sensor is turned on

        msg = "Reading: " + str(generateTemperatureReading())
        toSend = json.dumps({ "client": subTopic, "message": msg })
        print(msg)
        client.publish(pubTopic, toSend)        #publish the message
        time.sleep(3)       #sleep for 3 seconds

    client.loop_stop() 
