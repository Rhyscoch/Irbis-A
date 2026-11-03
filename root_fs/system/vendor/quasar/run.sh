#!/bin/sh

cd /data/quasar
rm -f daemons_logs/*.log.*  # Due to changed logfile naming, see https://st.yandex-team.ru/QUASAR-4308#5d146a91874b2b0020b76bb2

# Create FIFO for bluetoothd and libsoft_prep. audiod (which is using libsoft_prep) send signal for stream out
# using this fifo. Bluetoothd read fifo and send signal to SINK devices. To prevent race condition -> create
# fifo before audiod and yiod (bluetoothd) event started
mkfifo /tmp/loop_capture_pcm

export CA_CERTIFICATES=/system/vendor/quasar/ca-certificates.crt
export LD_LIBRARY_PATH=/system/vendor/quasar/libs

ulimit -n 10240
# Set up Stack size as 1MB
# Our software has over 100 threads. It cause over 800MB virtual memory size (when device actualy has 128MB flash)
ulimit -s 1024

nohup /system/vendor/quasar/quasar_launcher /system/vendor/quasar/launch.json > launcher.out 2> launcher.err&

sleep 1
