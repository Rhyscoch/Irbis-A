#!/bin/sh
mknod  /dev/nvram c 211 0

#for ubi mount
ubiattach /dev/ubi_ctrl -m 5
mount -t ubifs /dev/ubi1_0 /bkupgrade

#patch
cp /system/workdir/lib/alsa/dmixer_48k.conf /system/workdir/lib/alsa/dmixer.conf

if [ -f /vendor/wpa_supplicant.conf ]; 
	then echo /vendor/wpa_supplication.conf find
else
	cp /etc/wpa_supplicant.conf /vendor/wpa_supplicant.conf
fi
if [ -f /usr/bin/input_eventd ]; 
	then mv /usr/bin/input_eventd /vendor/input_eventd_org
fi
mkdir -p /bkupgrade/data/quasar
sync

cd /system/workdir
source /system/workdir/evn_amlogic.sh
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/system/vendor/quasar/libs

#mplayer 48K
#sed -i 's/lavcresample=44100/lavcresample=48000/g' /tmp/config

ifconfig lo up

#for Alexa debug
mkdir -p /tmp/web

#for cxdish i2c
ln -s /dev/i2c-4 /dev/i2cM0

#for Http server
#boa &

#for BT
mkdir -p /vendor/bsa

#user application
source /system/workdir/user/evn_user.sh

#for launch rootApp
rootApp &
