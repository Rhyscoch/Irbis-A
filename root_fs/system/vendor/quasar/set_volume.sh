#!/bin/sh

LD_LIBRARY_PATH=/system/vendor/quasar/libs /system/workdir/bin/amixer sset 'Master' $1%
