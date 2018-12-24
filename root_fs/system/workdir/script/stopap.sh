#!/bin/sh

killall udhcpd > /dev/null


# guess what wifi model we are using(light detect, may not match!!!)
INTERFACE=wlan1
DRIVER=nl80211

dhd_priv iapsta_disable ifname $INTERFACE 
ifconfig $INTERFACE down

