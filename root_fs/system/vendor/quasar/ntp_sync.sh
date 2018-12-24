#!/bin/sh

while true; do
    /system/vendor/quasar/ntpdate -p 1 ru.pool.ntp.org

    date +%s > /data/quasar/data/monotonic_time
    sleep 15
done
