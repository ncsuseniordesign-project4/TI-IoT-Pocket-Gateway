# TI-IoT-Pocket-Gateway

Run the following commands after cloning or after git pull

First, go to the directory with all the scripts and the package.json file

To install the package dependencies, run the following command

          npm install

A folder called node_modules will be created with all the azure api code

Now, edit the one of the scripts and add your IoT Device primary key to the connectionString variable
Save the script.

Run the script with node command.

          node [script-of-your-choice].js
 
The data will be sent to the IoT device specified by the connectionString in JSON format
