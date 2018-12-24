#!/bin/sh

oldlog="/vendor/wiimu/old.log"

rm -f /tmp/web/sys.log
sync
echo -e "=========================================== kernel log ================================================\n\n\n" > /tmp/sys.log
cat -n /proc/kmsg >> /tmp/sys_kernel.log
cat /tmp/sys_kernel.log >> /tmp/sys.log
echo -e "=========================================== apllication log ===========================================\n\n\n" >> /tmp/sys.log
cat -n /proc/conlog >> /tmp/sys_app.log
cat /tmp/sys_app.log >> /tmp/sys.log

if [ -f "$oldlog" ]; then
	echo -e "=========================================== previous log ===========================================\n\n\n" >> /tmp/sys.log
	cat $oldlog >> /tmp/sys.log	
fi

sync
/system/workdir/bin/logtool /tmp/sys.log /tmp/web/sys.log
rm -f /tmp/sys.log
sync

