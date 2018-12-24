#!/bin/sh

echo "User setup env"


export PATH=$PATH:$WORKDIR/user:$WORKDIR/../vendor/quasar
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$WORKDIR/../vendor/quasar/libs

echo "User setup envirnoment OK"
