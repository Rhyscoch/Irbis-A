#!/bin/sh

mv /usr/bin/adbd_backup /usr/bin/adbd
nohup /usr/bin/adbd > /dev/null 2> /dev/null &
