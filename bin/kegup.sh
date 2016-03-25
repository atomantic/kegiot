#!/bin/sh
#/etc/init.d/kegup

export PATH=$PATH:/usr/local/bin
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules

case "$1" in
  start)
  export USBPATH=$(lsusb | grep -i 'Future Technology Devices' | cut -d' ' -f 2,4 | cut -d':' -f 1)
  exec forever start /opt/kegiot/app/server/app.js
  ;;
stop)
  exec forever stopall
  ;;
*)
  echo "Usage: /etc/init.d/kegup {start|stop}"
  exit 1
  ;;
esac

exit 0
