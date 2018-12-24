#!/bin/sh
echo Run local upgrade using image:$1

cd /system/workdir
source /system/workdir/evn_amlogic.sh

a01localupdate $1
