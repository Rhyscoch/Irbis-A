#!/bin/sh

if [ "$1" = "start" ]; then

    echo 1  > /proc/sys/vm/overcommit_memory

    echo 25M > /sys/block/zram0/disksize
    /sbin/mkswap /dev/zram0
    /sbin/swapon /dev/zram0

    rm -f /bkupgrade/update_*

    export LD_LIBRARY_PATH=/system/vendor/quasar:/system/vendor/quasar/libs:$LD_LIBRARY_PATH
    export PATH=/system/vendor/quasar:$PATH
    export GST_PLUGIN_PATH=/system/vendor/quasar/libs

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
        mkdir -m 777 -p /data/quasar/daemons_logs
        mkdir -m 777 -p /data/quasar/data

        echo "Generating keys..."
        /system/vendor/quasar/gen_keys.sh
    fi

    # Create symlinks for QUASAR ALSA build to work correctly in Linkplay environment

    if ! { [ -L /lib/linkplay_a98/alsa-lib ] && [ "$(readlink -- /lib/linkplay_a98/alsa-lib)" = /system/vendor/quasar/libs ]; }; then
        if [ -e /lib/linkplay_a98/alsa-lib ]; then
            rm -rf /lib/linkplay_a98/alsa-lib
        fi

        mkdir -p /lib/linkplay_a98
        ln -s /system/vendor/quasar/libs /lib/linkplay_a98/alsa-lib
    fi

    ln -s /system/workdir/lib/alsa /usr/share/alsa

    rm /system/workdir/lib/hisf_config.ini
    ln -s /system/vendor/quasar/hisf_config.ini /system/workdir/lib/hisf_config.ini
    cp /system/vendor/quasar/license.txt /system/workdir/lib/license.txt

    # Imitate PCM device open for 'Master' control to appear

    /system/workdir/bin/aplay /dev/null
    # Set initial volume level
    # /system/workdir/bin/amixer sset 'Master' 85%

    chmod 777 /data/quasar
    chmod 777 /data/quasar/logs

    currentTime=`date +%s`
    controlTime=1549411200 # 06.02.2019 00:00:00 UTC

    if [ -s /data/quasar/data/monotonic_time ]; then
        controlTime=`cat /data/quasar/data/monotonic_time`
    fi

    if [[ $currentTime -le $controlTime ]]; then
          date +%s -s @$controlTime
    else
       echo "Time was not changed"
    fi

    route delete default gateway 10.10.10.254 wlan1
    cd /system/vendor/quasar

    # remove bt_config.xml to reset bluetooth name
    rm -f /bkupgrade/bsa/bt_config.xml

    /system/vendor/quasar/run.sh
    /system/vendor/quasar/ntp_sync.sh &

    touch /data/quasar/initialized
elif [ "$1" = "stop" ]; then
    pkill quasar_launcher
fi
