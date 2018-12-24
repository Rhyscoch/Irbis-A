#!/bin/sh

cd /data/quasar

export LD_LIBRARY_PATH=/system/vendor/quasar/libs
nohup /system/vendor/quasar/quasar_launcher /system/vendor/quasar/launch.json > launcher.out 2> launcher.err&

sleep 1
