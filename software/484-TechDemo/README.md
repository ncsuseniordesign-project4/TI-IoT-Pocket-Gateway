# TI-IoT-Pocket-Gateway

## Dependencies

* bonescript
* azure-iot-device
* azure-iot-device-mqtt

Dependencies can be installed via `npm install <dependency_name>`. Note that `bonescript` is install by default on the PocketBeagle and does not need to be reinstalled.

## Cloud9 IDE QuickStart
The PocketBeagle must have an exsiting network connection.

First, clone this repo to a new subfolder of `/var/lib/cloud9` on the PocketBeagle. Next, start up Cloud9 in your web browser. In the left hand Workspace view a new `TI-IoT-Pocket-Gateway` folder will now be present. Expand this folder as well as the 484-TechDemo folder. The `484-TechDemo.js` file will now be displayed and can be opend by double clicking it. This will open the source code in the IDE.

Now that the file is open switch to the Clound9 terminal. Ensure the project dependencies are installed (see the above dependencies section). Once the dependencies have been installed ensure your IoT Device primary key has been added to the configuration file at `/etc/484-TechDemo.conf`. If no configuration file has yet been created a sample configuration, `484-TechDemo.conf.sample`, has been provided which can be copied to `/etc/484-TechDemo.conf`.

Once the configuration is correct the program can be started via Cloud9's "Run" button. Once started the program will print the messages it sends to Azure to the log and the RGB LED will be controllable by moving the TechLab around.

### Cloud9 Autostart

This program can be autostarted by Cloud9 by copying or symlinking it to the `/var/lib/cloud9/autorun` folder. An active network connection is not required to start the program and the program will automatically start sending messages to Azure once a network connection has been made.

## NPM and Node QuickStart
Run the following commands after cloning or after git pull.

First, go to the directory with all the scripts and the package.json file

To install the package dependencies, run the following command:

```
npm install
```

A folder called `node_modules` will be created with all the Azure dependencies

Now, edit `/etc/484-TechDemo.conf` to provide the program with your IoT Device primary key. A sample config, `484-TechDemo.conf.sample`, has been provided so the configuration file does not need to be created from scratch.

Run the script with node command:

```
node [script-of-your-choice].js
```

The data will be sent to the IoT device specified by the connectionString in JSON format.
