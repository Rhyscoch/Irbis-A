#!/bin/sh

powerStateFile="/sys/power/state"
powerResumeFlag="/etc/adckey/powerState"

powerStateChange()
{
       echo "mem" > $powerStateFile
}

volumeUpAction()
{
    local volumeMax=`amixer sget "Master"|grep "Limits:"|awk '{print $4}'`
    local volumeCurrent=`amixer sget "Master" |grep "Mono:" |awk '{print $2}'`
    if [ $volumeCurrent -le $volumeMax ];then
        let volumeCurrent+=10
        echo "$volumeCurrent"
        if [ $volumeCurrent -ge $volumeMax ];then
            volumeCurrent=$volumeMax
        fi
        amixer sset "Master" $volumeCurrent
    fi
}

volumeDownAction()
{
    local volumeMin=`amixer sget "Master" |grep "Limits:" |awk '{print $2}'`
    local volumeCurrent=`amixer sget "Master" |grep "Mono:" |awk '{print $2}'`
    if [ $volumeCurrent -ge $volumeMin ];then
        let volumeCurrent-=10
        if [ $volumeCurrent -lt $volumeMin ];then
            volumeCurrent=$volumeMin
        fi
        amixer sset "Master" $volumeCurrent
    fi
}

wifiSmartConfig()
{
	brcm_smartconfig.sh
}

ble_wifi_setup()
{
	echo "ble config for wifisetup"
	rm /etc/bsa/config/wifi_tool.sh
	ln /var/www/cgi-bin/wifi/wifi_tool.sh  /etc/bsa/config/wifi_tool.sh
        killall btgatt-server
	local app1_id=`ps | grep "app_musicBox" | awk '{print $1}'`
	kill -9 $app1_id
	local app2_id=`ps | grep "app_ble_wifi_setup" | awk '{print $1}'`
	kill -9 $app2_id
	if [ ! -f "/etc/bsa/config/wifi_status" ]; then
		touch /etc/bsa/config/wifi_status
		chmod 644 /etc/bsa/config/wifi_status
	fi
	echo 0 > /etc/bsa/config/wifi_status
       
	hciconfig hci0 > /dev/null
	if [ $? -eq 0 ];then
		btgatt-server &
                bluez_tool.sh restart ble rtk
	else
		cd /etc/bsa/config
		app_ble_wifi_setup &
		app_musicBox  ble_mode &
	fi
}

case $1 in
    "power") powerStateChange ;;
    "VolumeUp") volumeUpAction ;;
    "VolumeDown") volumeDownAction ;;
    "longpressWifiConfig") wifiSmartConfig ;;
    "WifiConfig")  ble_wifi_setup ;;
    *) echo "no function to add this case: $1" ;;
esac

exit
