#!/bin/sh
. /sbin/config.sh
. /sbin/global.sh

. ./evn.sh

	wan.sh
	iwevent &
	echo "enter live.sh"
	date
	
	fmt=0
	cmd=`ls /bin/mtd_w*`
	umount /dev/mtdblock9 -l
	umount /dev/mtdblock8 -l
	mount -t jffs2 /dev/mtdblock8 /mnt
	
	
	if [ $? -ne 0 ]; then
  	fmt=1
	echo "**********mount mtdblock8 failed, erase and format it**************"
	else
  	df | grep "/dev/mtdblock8" | grep "100%"  && fmt=1
  	mount | grep "/dev/mtdblock8" | grep "ro" && fmt=1
	echo "*********check the mtdblock8 writable or not***********************"
	fi


	if [ $fmt -ne 0 ]; then
	echo "*********mtdblock8 not writable, erase and format it***************"
  	umount /dev/mtdblock8
  	$cmd erase user
  	/system/workdir/script/format_jffs2.sh /dev/mtdblock8
  	mount -t jffs2 /dev/mtdblock8 /mnt
	fi
        
        mount -t jffs2 /dev/mtdblock9 /vendor
        if [ $? -ne 0 ]; then
	echo "*****************mtdblock9 need to re-mount*************************"
            echo "mount /dev/mtdblock9 failed, try to format"
            /system/workdir/script/format_jffs2.sh /dev/mtdblock9
            mount -t jffs2 /dev/mtdblock9 /vendor
            if [ $? -eq 0 ]; then
                echo "mount /dev/mtdblock9 to /vendor succeed!"    
            else
                echo "mount /dev/mtdblock9 to /vendor failed!"     
            fi
        fi

       if [ -x /system/workdir/customer.sh ]; then
               /system/workdir/customer.sh &
       fi


	mknod /dev/muart c 250 0
	mknod /dev/enc c 248 0
	mknod /dev/nop_codec c 246 0
	mknod /dev/wm8918 c 246 0
	mknod /dev/wm8960 c 246 0
	mknod /dev/es8388 c 246 0
	mknod /dev/i2s_config c 221 0

	echo 212992 > /proc/sys/net/core/rmem_default
	echo 212992 > /proc/sys/net/core/rmem_max
	
	cp /system/workdir/misc/aliasr-ca.pem /tmp/alca.pem -fr
	cp /system/workdir/misc/aliasr-config.json /tmp/ -fr
	cp /system/workdir/lib/alsa /tmp/ -fr
	cp /system/workdir/misc/config /tmp/ -fr

	mkdir /tmp/web
	if [ -f /vendor/wiimu ]; then
		rm -f /vendor/wiimu
		mkdir /vendor/wiimu
	fi
	ln -s /vendor/wiimu /tmp/web/wiimu
	ln -s /mnt /tmp/web/mnt

	rootApp &
