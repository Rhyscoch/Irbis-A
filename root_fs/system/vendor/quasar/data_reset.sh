#!/bin/sh

rm -rf /data/quasar/*
cp /etc/wpa_supplicant.conf-orig /vendor/wpa_supplicant.conf
sync
