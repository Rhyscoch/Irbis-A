#!/bin/sh
if [ -d "/tmp/vendor_bak" ]; then
	cp /tmp/vendor_bak/* /usr/data/ -ar
	sync
	rm -rf /tmp/vendor_bak/
fi

