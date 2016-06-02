Kegiot
=======
DIY Internet of Things (IoT) smart beverage dispenser.

This was a weekend hack project that turned into a maintained beverage dispenser.

I'll be giving a talk on this and touring the codebase as well as how the device was put together at [LinuxFest Northwest 2016](https://www.linuxfestnorthwest.org/2016)

Talk in progress: http://adameivy.com/presentation_kegerator/


# Warning
This codebase has been ported from a particular setup. Authentication was removed (as it was a proprietary setup).
The creator of this codebase assumes no responsibility for stolen beverages.


# Developer Getting Started
Assumes you are on OSX (yeah, we are opinionated).
You don't need to have a Beagle Bone Black connected to just run the app and test it. The app will mock all hardware interfaces.

```
# fork it
# clone it
cd kegiot
./dev init
```

This will make sure you have node.js and global module installations for `gulp`, `bower`, `npm-check` and will run `npm install && bower install`. Once ready, it will run `gulp`, which will launch the Admin UI. The UI will be running in `desktop` mode, which will mock all of the hardware interfaces (LCD, RFID scanner, temperature monitoring, ballvalve controller, etc).


## Authentication
This app has stripped out the authentication mechanism (because it was a proprietary auth service). You'll need to wire in your own to identify admin users or restrict access to the UI another way.
If you add auth:
* remove `.isAdmin.isAuthed` from `app/server/views/index.jade`
* re-enable the `requireAdmin` logic in `app/server/lib/common.js`
* remove default object keys from `app/client/js/app.js` in App.user (should be empty object)
* enable any place in the code where you find `authLib` (replace with auth solution)

## Slack notifications
You will need to supply your own slack hook URL as an env `SLACKHOOK` if you want the watchdog to notify temperature and keg volume limits as well as broadcast the location of the admin UI.

## Beagle Bone Black

0. Make sure you have setup a non-root user
```
apt-get update
useradd bbb
password bbb
password root
echo "bbb ALL=(ALL) ALL" >> /etc/sudoers
mkhomedir_helper bbb
mkdir -p /opt/kegiot
chown -R bbb:bbb /opt/kegiot
su bbb
chsh /bin/bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash
. ~/.bashrc
nvm install 4.4.5
```
1. Plugin an ethernet cable and USB
2. Run the BBB install script
```
./dev install
```
3. Deploy the code
```
./dev deploy
```

## Deploy to the Bone branch
in order to allow the Beagleboard to not have to install gulp, sass, etc and build the project on the board, we publish the built output of the UI (post-sass) via:
```
gulp deploy
```
After that, we can `git pull` on the Beagleboard and we've got the built UI.
This assumes you went through and installed git, created an ssh key on the board (if needed) and deployed the whole codebase via git.
Alternatively, you can use the `dev` script to continue to deploy partial code without rebuilds or git.

## Guides
http://elinux.org/Beagleboard:BeagleBoneBlack_Debian

http://beagleboard.org/support/bonescript

## i2c (LCD)

Check the pinout here: http://beagleboard.org/static/images/cape-headers.png

Connect the Ground, 5v, 3v, clock, data to the bbb.
skip VDD_5V as it is only available when the Bone is plugged into the 5V power outlet. You can use the SYS_5V when only plugged into USB on your computer.

http://www.bibase.com/ascii.htm

```
ssh root@192.168.7.2
root@beaglebone:/var/lib/cloud9/myScripts# i2cset 1 0x04 0x63 0x40 0x00 0x00 i
root@beaglebone:/var/lib/cloud9/myScripts# i2cset 1 0x04 0x68 0x40 0x00 0x00 i
root@beaglebone:/var/lib/cloud9/myScripts# i2cset 1 0x04 0x70 0x00 0x00 0x00 0x48 0x69 0x64 0x65 0x79 0x20 0x68 0x6F i
```

The above are the commands that clear the lcd, home the cursor and print the message "Hidey ho"

# License
ISC

# Contributing
We welcome pull-requests. Feel free to fork, and deviate! Drink on.
