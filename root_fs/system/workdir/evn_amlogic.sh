#!/bin/sh

echo "Linkplay setup env"

ROOT=$PWD

export LANG=UTF-8
export CHARSET=UTF-8
export LD_LIBRARY_PATH=/tmp/lib:$ROOT/lib:$LD_LIBRARY_PATH

PATH=$PATH:/tmp/bin:$ROOT/bin
export PATH
export WORKDIR=$ROOT

#for system
#coredump unlimited
#ulimit -c unlimited
#echo "/tmp/core-%e-%p-%t" > /proc/sys/kernel/core_pattern
#stack in KB
#ulimit -s 512

#for ALSA
cp -r $ROOT/lib/alsa /tmp
export ALSA_CONFIG_DIR=/tmp/alsa/
export ALSA_CONFIG_PATH=$ALSA_CONFIG_DIR/alsa.conf

#for MPlayer
export MPLAYER_HOME=/tmp
cp -r $ROOT/misc/config /tmp

echo "auto set envirnoment OK"
