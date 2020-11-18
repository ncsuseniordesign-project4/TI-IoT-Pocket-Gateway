/**
 * The following script simulates a water pump which turns the LED (connected on pin 19) 
 * on or off when the respective command is received from the MQTT broker.
 * 
 * TI IoT Pocket Gateway Team at NC State University (ECE 484/485 - Senior Design - 2020)
 * 
 * Author: Janak Patel
 * 
 * The following code is a modified version of the script written by Rui Santos from 
 * randomnerdtutorials.com. The original version can be found on the below link
 * https://randomnerdtutorials.com/esp32-mqtt-publish-subscribe-arduino-ide/
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include "Esp32MQTTClient.h"

// Please input the SSID and password of WiFi
const char* ssid     = ""; /*WiFi name here*/
const char* password = ""; /*WiFi password here*/
const int   redLEDPin = 19;
const char* mqtt_server = "";  /*Ip address of the broker*/

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  Serial.println("Starting connecting WiFi.");
  delay(10);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  delay(50);
  client.setServer(mqtt_server, 1883);  /* Set the MQTT server */
  client.setCallback(callback);
  pinMode(redLEDPin, OUTPUT);
  digitalWrite(redLEDPin, LOW);
}

void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String tempMessage;
  
  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    tempMessage += ((char)message[i]);
  }
  Serial.println();

  if (tempMessage == "ON"){
    Serial.println("Turning ON the water pump");
    digitalWrite(redLEDPin, HIGH);
    client.publish("Cloud", "{\"client\":\"ESP32\", \"message\":\"Successfully turned on the water pump\"}");
  }
  else if (tempMessage == "OFF"){
    Serial.println("Turning OFF the water pump");
    digitalWrite(redLEDPin, LOW);
    client.publish("Cloud", "{\"client\":\"ESP32\", \"message\":\"Successfully turned off the water pump\"}");
  }
  else {
    Serial.println("Unknown command received");
    client.publish("Cloud", "{\"client\":\"ESP32\", \"message\":\"Received an unknown command! No changes made\"}");
  }
  
}

void reconnect() {
  digitalWrite(redLEDPin, LOW);
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP32")) {
      Serial.println("connected");
      // Subscribe
      client.subscribe("ESP32");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void loop() {
  
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}
