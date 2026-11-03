#!/bin/sh

if [ $1 -gt 0 ]; then
    echo 0 > /sys/class/rfkill/rfkill0/state
    pkill bsa_server;
    echo 1 > /sys/class/rfkill/rfkill0/state

    setsid /system/workdir/bin/bsa_server -d /dev/ttyS1 -p /etc/bluetooth/BCM43430.hcd  -r13 -u /tmp/ > /dev/null &
else
    echo 0 > /sys/class/rfkill/rfkill0/state
    pkill bsa_server
fi

