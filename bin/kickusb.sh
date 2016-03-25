#!/usr/bin/env bash

echo "kicking USB..."
export USBPATH=$(lsusb | grep -i 'Future Technology Devices' | cut -d' ' -f 2,4 | cut -d':' -f 1 | sed 's/ /\//')
echo "/opt/kegiot/bin/usbreset /dev/bus/usb/$USBPATH"
/opt/kegiot/bin/usbreset /dev/bus/usb/$USBPATH
code=$?
if [ $code == 0 ]; then
  echo "success: restarting service"
  echo "make sure USBDEVICEID is current: $USBDEVICEID"
  export USBDEVICEID=$(dmesg | grep tty | grep "FTDI USB Serial" | tail -1 | grep -oE '[^ ]+$');
  echo "USBDEVICEID set: "$USBDEVICEID;
  sleep 2
  forever restartall
fi
echo "code: $code";
exit $code
