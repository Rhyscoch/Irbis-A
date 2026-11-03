#!/bin/sh

rm -f /tmp/web/sys_avs.log
sync

cat -n /proc/conlog | grep 'LOG_CHECK' >> /tmp/sys_app_avs.log
cat /tmp/sys_app_avs.log >> /tmp/web/sys_avs.log

sync
