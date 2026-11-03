#!/bin/sh

# disable amplifiers
/system/workdir/bin/localSendSocket 0 CLOSEDAC

reboot
