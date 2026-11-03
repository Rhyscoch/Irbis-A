#!/bin/sh

oldlog="/vendor/wiimu/old.log"

rm -f /tmp/web/sys.log
sync
echo -e "=========================================== kernel log ================================================\n\n\n" > /tmp/web/sys.log
cat -n /proc/kmsg >> /tmp/sys_kernel.log
cat /tmp/sys_kernel.log >> /tmp/web/sys.log
echo -e "=========================================== apllication log ===========================================\n\n\n" >> /tmp/web/sys.log
cat -n /proc/conlog >> /tmp/sys_app.log
cat /tmp/sys_app.log >> /tmp/web/sys.log

if [ -f "$oldlog" ]; then
	echo -e "=========================================== previous log ===========================================\n\n\n" >> /tmp/web/sys.log
	cat $oldlog >> /tmp/web/sys.log	
fi

sync
