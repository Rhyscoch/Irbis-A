#!/bin/sh

cd /data/quasar

openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem

sync
