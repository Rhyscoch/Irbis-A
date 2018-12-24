#!/bin/sh

ARGS=1

if [ $# -ne "$ARGS" ]; then
    exit 1
fi

export LD_LIBRARY_PATH=/system/vendor/quasar/libs/:$LD_LIBRARY_PATH

OTAFILENAME=$1

if [ -f $OTAFILENAME ]; then
	pkill quasar_launcher
	pkill -9 pushd
	pkill -9 wifid

	echo 3 > /proc/sys/vm/drop_caches
	echo 1 > /proc/sys/vm/compact_memory

	/system/vendor/quasar/a01localupdate $OTAFILENAME > /data/quasar/a01localupdate.log 2>&1
fi

reboot
