#!/bin/sh

if [ "$1" = "start" ]; then

    rm -f /bkupgrade/update_*

    export LD_LIBRARY_PATH=/system/vendor/quasar:/system/vendor/quasar/libs:$LD_LIBRARY_PATH
    export PATH=/system/vendor/quasar:$PATH
    export GST_PLUGIN_PATH=/system/vendor/quasar/libs/gstreamer-1.0

    if [ ! -d "/bkupgrade/data/quasar" ]; then
        mkdir -p /bkupgrade/data/quasar
    fi

    if [ -f /system/vendor/need_hw_test ]; then
        echo "Running Linkplay factory_test utility..."
        export LD_LIBRARY_PATH=/system/vendor/quasar/override_libs:/system/vendor/quasar/libs:/system/workdir/lib
        cd /system/workdir
        . evn_amlogic.sh
        . user/evn_user.sh 
        nohup /system/vendor/quasar/factory_test &> /data/factory_test.log &
        exit 0
    fi

    if [ ! -f /data/quasar/initialized ]; then
        echo "First run. Initialization..."

        echo "Copying config..."
        mkdir -m 777 -p /data/quasar
        mkdir -m 777 -p /data/quasar/logs
        mkdir -m 777 -p /data/quasar/data
        
        echo "Generating keys..."
        /system/vendor/quasar/gen_keys.sh
    fi

    # Create symlinks for QUASAR ALSA build to work correctly in Linkplay environment

    mkdir -p /lib/linkplay_a98
    ln -s /system/vendor/quasar/libs /lib/linkplay_a98/alsa-lib
    ln -s /system/workdir/lib/alsa /usr/share/alsa

    rm /system/workdir/lib/hisf_config.ini
    ln -s /system/vendor/quasar/hisf_config.ini /system/workdir/lib/hisf_config.ini
    cp /system/vendor/quasar/license.txt /system/workdir/lib/license.txt

    # Imitate PCM device open for 'Master' control to appear

    /system/workdir/bin/aplay /dev/null
    /system/workdir/bin/amixer sset 'Master' 85%

    chmod 777 /data/quasar
    chmod 777 /data/quasar/logs

    date --set='2018-09-30'

    route delete default gateway 10.10.10.254 wlan1
    cd /system/vendor/quasar
    /system/vendor/quasar/run.sh
    /system/vendor/quasar/ntp_sync.sh &

    touch /data/quasar/initialized
elif [ "$1" = "stop" ]; then
    pkill quasar_launcher
fi
