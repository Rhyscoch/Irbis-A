#!/bin/sh


if [ -f "/tmp/jffs2.img" ]; then  
/system/workdir/script/burnjffs2.sh
fi

echo /bin/mtd_write -o $1 -l $2 write /tmp/root_uImage Kernel_RootFS 2>$3
/bin/mtd_write -o $1 -l $2 write /tmp/root_uImage Kernel_RootFS 2>$3
