#!/bin/sh


INTERFACE=wlan0
DRIVER=nl80211

sleep 3
ifconfig $INTERFACE down
sleep 2
ifconfig $INTERFACE up

