# TI-IoT-Pocket-Gateway

## SIM7000A `systemd` connection service

This directory contains a set of scripts and an associated `systemd` service for managing the cellular modem connection. These scripts internally use `libqmi` and `udhcpc` so these tools must be installed on the PocketBeagle (`sudo apt install libqmi-utils udhcpc`). See below note about a `libqmi` bug that exists in some versions.

To use this service this `sim7000A-qmi-start` and the `sim7000A-qmi-stop` files must be places in the `/usr/local/bin` directory. The service file, `sim7000A.service`, should be placed in `/etc/systemd/system`. Before the service can be used the configuration file, `qmi-network.conf`, should be edited with APN information for the cellular network in use and then placed in the `/etc/` directory.

Once all of the files are in place execute `sudo systemctl daemon-reload` so `systemd` can pick up on our new service file.

## Usage

Once the above configuration is complete the service can be controlled via the following commands:

* `sudo systemctl start sim7000A`
* `sudo systemctl stop sim7000A`
* `sudo systemctl status sim7000A`
* `sudo systemctl restart sim7000A`

To have the cellular modem auto-connect on startup run `sudo systemctl enable sim7000A`. To turn this off, run `sudo systemctl disable sim7000A`.

### `libqmi` Bug

`libqmi-1.16.2` has a bug that prevents the `qmi-network` command from working. This command is used by the scripts above so if this version of `libqmi` is being used the bug must be fixed. To fix the bug, edit the `/usr/bin/qmi-network` script and change this line:

```
START_NETWORK_ARGS="apn='$APN'"
```

to

```
START_NETWORK_ARGS="apn=$APN"
```

which is simply removing the single quotes from around `$APN`. The `qmi-network` command should now be working.
