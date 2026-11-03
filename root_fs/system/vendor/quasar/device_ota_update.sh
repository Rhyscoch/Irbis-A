#!/bin/sh

ARGS=1

if [ $# -ne "$ARGS" ]; then
    exit 1
fi

export LD_LIBRARY_PATH=/system/vendor/quasar/libs/:$LD_LIBRARY_PATH

OTAFILENAME=$1

if [ -f $OTAFILENAME ]; then
    pkill quasar_launcher
    sleep 5
    pkill -9 maind

    /system/workdir/bin/localSendSocket 0 CLOSEDAC

    echo 3 > /proc/sys/vm/drop_caches
    echo 1 > /proc/sys/vm/compact_memory

    /system/vendor/quasar/a01localupdate $OTAFILENAME > /data/quasar/a01localupdate.log 2>&1
else
    echo "Ota file doesn't exists or is not a file."
fi
