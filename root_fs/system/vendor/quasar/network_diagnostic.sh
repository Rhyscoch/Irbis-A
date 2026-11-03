#!/bin/sh

# Get default interface from routing table
DEFAULT_INTERFACE=$(route -n | awk '$1 == "0.0.0.0" {print $8; exit}')

# Get current ip address
IP_ADDRESS=$(ifconfig "$DEFAULT_INTERFACE" | awk 'sub(/.* inet addr:/, "") {print $1}')

# Get interface stats
RX_PACKETS=`cat /sys/class/net/$DEFAULT_INTERFACE/statistics/rx_bytes`
TX_PACKETS=`cat /sys/class/net/$DEFAULT_INTERFACE/statistics/tx_bytes`

# Get SSID from scan dump
IW_SCAN_DUMP=`iw dev $DEFAULT_INTERFACE scan dump | grep SSID | xargs echo`

# Check if wlan0 is up
WLAN0_OPERSTATE=`cat /sys/class/net/wlan0/operstate`

# Write data in json format
echo "{\"iface\":\"$DEFAULT_INTERFACE\", \"ip_addr\":\"$IP_ADDRESS\", \"rx\":\"$RX_PACKETS\", \"tx\":\"$TX_PACKETS\", \"iw_scan_dump\":\"$IW_SCAN_DUMP\", \"wlan0_operstate\":\"$WLAN0_OPERSTATE\"}"
