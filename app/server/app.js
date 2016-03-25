// 3rd party modules
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var debug = require('debug')('myapp:server');
var express = require('express');
var http = require('http');
var path = require('path');
var logger = require('morgan');

// our libraries
var _ = require('./lib/_');
var common = require('./lib/common');
var config = require('./data/configs');
var flowmeter = require('./lib/flowmeter');
var lcd = require('./lib/lcd');
var lcd_msg = require('./lib/lcd_msg');
var network = require('./lib/network');
var rateLimit = require('./lib/rate_limit');
var rfid = require('./lib/rfid');
var temperature = require('./lib/temperature');
// var usb = require('./lib/usb');
var valve = require('./lib/valve');
var watchdog = require('./lib/watchdog');

lcd.clear();
lcd.print("App configuring", null);

var port = process.env.PORT || 4337;

var app = express();

app.set('port', port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, '../public')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use(function(req, res, next) {
  var configs = {};
  _.each(config.configs, function(c) {
    configs[c.name] = c.value;
  });
  res.locals.config = JSON.stringify(configs);
  res.locals.defaultUser = JSON.stringify(configs);
  next();
});
app.use('/', require('./api/index'));

// USERS
app.get('/api/users', require('./api/users.get'));
app.get('/api/user/:id', require('./api/user.get'));
app.put('/api/user/:id', common.requireAdmin, require('./api/user.put'));
app.delete('/api/user/:id', common.requireAdmin, require('./api/user.delete'));

// KEGS
app.get('/api/kegs', require('./api/kegs.get'));
app.get('/api/keg/:id', require('./api/keg.get'));
app.put('/api/keg/:id', common.requireAdmin, require('./api/keg.put'));
app.delete('/api/keg/:id', common.requireAdmin, require('./api/keg.delete'));

// Configs
app.get('/api/configs', require('./api/configs.get'));
app.get('/api/config/:id', require('./api/config.get'));
app.put('/api/config/:id', common.requireAdmin, require('./api/config.put'));
app.delete('/api/config/:id', common.requireAdmin, require('./api/config.delete'));

// Usage
app.get('/api/usages', require('./api/usage.get'));
app.get('/api/usage/:id', require('./api/usage.get'));
app.put('/api/usage/:id', common.requireAdmin, require('./api/usage.put'));
app.delete('/api/usage/:id', common.requireAdmin, require('./api/usage.delete'));

// Metrics
app.get('/api/temperature', require('./api/temperature.get'));

// LCD
app.post('/api/lcd', common.requireAdmin, require('./api/lcd'));
// USB
app.post('/api/usb.reset', common.requireAdmin, require('./api/usb.reset'));
// Restart
app.post('/api/restart', common.requireAdmin, require('./api/restart'));

// test stuff
app.get('/api/test', require('./api/test'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err
  });
});

/**
 * Default to close value at start to be safe
 */
valve.closeValve();

/**
 * Start Server
 */
lcd.clear();
lcd.print("Starting server", null);

var server = http.createServer(app);

// socket.io
var io = require('socket.io')(server);
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);

server.on('error', function(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.on('listening', function() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
});

setInterval(function() {
  temperature.readTemperature(function(data) {
    // console.log('emitting temperature: ', data);
    io.sockets.emit('temp', data);
  });
}, 500);
io.on('connection', function(socket) {
  // socket.emit('hello', { hello: 'world' });
  socket.on('session', function(session) {
    // get the user from DB
    var user = common.db.users.find({
      // TODO: you will need to build your own session service!
      id: session.requester.identifier.toUpperCase()
    });
    console.log('login', user);
    socket.emit('user', user);
  });
});

rfid.onUserScan(function(user) {
  io.sockets.emit('userscan', user);
  console.log('rfid scanned', user);
  var amountRemaining = rateLimit.getVolumeRemaining(user);
  console.log('amountRemaining', amountRemaining);
  if (amountRemaining < 1) {
    return false;
  }
  // at least 1ml is allowed
  valve.openValve();
  console.log('valve open');
  // create flow counter
  var flowcounter = flowmeter();
  var changed = 0;
  var secondsIdle = 0;

  // per pour
  var pourLimit = common.db.configs.find({
    name: 'ml_per_pour'
  }).value;
  console.log('pourLimit', pourLimit);

  // assume no flow and shut off if the user doesn't flow for 10 seconds
  var checkFlow = setInterval(function() {
    var currentVolume = flowcounter.getVolume();
    console.log('volume check:', currentVolume, changed, secondsIdle);
    if (changed === currentVolume) {
      secondsIdle++;
    }
    changed = currentVolume;
    if (secondsIdle >= 10) {
      console.log('idle_timeout');
      flowcounter.stop();
      clearInterval(checkFlow);
      valve.closeValve();
      lcd_msg.showDeniedMsg('idle_timeout');
      // log it
      common.db.usage.push({
        id: _.uuid(),
        user: user.id,
        date: (new Date()).toLocaleDateString(),
        amount: changed
      });
      common.db.kegs.find({
        id: 'e3a78fda-b945-4256-af3f-f878d356901c'
      }).volume -= changed;
    }
  }, 1000);

  // watch the flow
  flowcounter.onVolumeChange(function(total) {
    console.log('volumechange', total, amountRemaining);
    var pourLimitReached = total >= pourLimit;
    var dailyLimitReached = total >= amountRemaining;
    if (pourLimitReached || dailyLimitReached) {
      console.log('volumechange:done', total, pourLimit, amountRemaining);
      // done!
      flowcounter.stop();
      clearInterval(checkFlow);
      valve.closeValve();
      // log it
      common.db.usage.push({
        id: _.uuid(),
        user: user.id,
        date: (new Date()).toLocaleDateString(),
        amount: total
      });
      // take that much out of the keg
      // TODO: handling for muliple kegs and handling/config of active keg?
      common.db.kegs.find({
        id: 'e3a78fda-b945-4256-af3f-f878d356901c'
      }).volume -= total;
    }
  });
}, function(newRfid) {
  // unknown card
  io.sockets.emit('rfid', {
    code: newRfid
  });
});

/* ************************************************
// WATCH DOGs
/* ***********************************************/
lcd.clear();
lcd.print("Starting watchdogs", null);

watchdog.watchdog('networkIP', {
  monitor: function(callback) {
    var configs = common.db.configs;
    var iface = configs.find({
      name: 'iface'
    }).value;

    if (iface === null || iface === undefined) {
      console.log('Malformed or missing iface configuration setting.');
      return;
    }

    var ip = network.getIPv4(iface);
    if (ip === null || ip === undefined) {
      console.log('Unable to find IP address for network IFACE: ' + iface);
      return;
    }

    if (network.isNewIP(network.getIPv4, iface)) {
      console.log("New IP [" + ip + "] for IFACE " + iface);
      network.saveIP(iface, ip);
      callback("Kegiot is running at http://" + ip + ":" + port);
    }
  },
  pollPeriod: 10000
});

watchdog.watchdog('temperature', {
  monitor: function(callback) {
    var configs = common.db.configs;
    var min_temp = configs.find({
      name: 'min_temp'
    }).value;
    var max_temp = configs.find({
      name: 'max_temp'
    }).value;

    if (min_temp === null || min_temp === undefined
      || max_temp === null || max_temp === undefined) {
      console.log("Unable to get min and max temperature thresholds.");
      return;
    }

    temperature.readTemperature(function(temp) {
      if (temp < min_temp || temp > max_temp) {
        console.log("Temp threshold hit at " + temp + "F");
        callback("Kegiot temperature hit threshold of " + temp + "F");
      }
    });
  },
  pollPeriod: 60000
});

var isBeerMsg = true;

watchdog.watchdog('lcd msg', {
  monitor: function(callback) {
    var msg = null;

    lcd.clear();

    if (isBeerMsg) {
      var kegs = common.db.kegs;
      var keg = kegs.first();
      var name = keg.name;
      var beer = keg.beer;

      isBeerMsg = false;
      msg = 'On tap ' + beer + " by " + name;

      // TODO Remove when temp is back online
      lcd.clear();
      lcd.print(msg, null);

    /*
         // TODO add back when temp sensor back online
          temperature.readTemperature(function(temp) {
            lcd.row(0, function() {
              lcd.print(msg, null);
            });
            lcd.row(1, function() {
              lcd.print('Keg Temp ' + temp + 'F', null);
            });
          });
    */
    } else {
      isBeerMsg = true;

      lcd_msg.getDisplayMsg(function(dispMsg) {
        if (dispMsg.length > 1) {
          msg = dispMsg[0] + dispMsg[1];
        } else {
          msg = dispMsg[0];
        }
        lcd.clear();
        lcd.print(msg, null);
      });
    }
  },
  pollPeriod: 10000
});

// watch for USB changing address
if (process.env.MODE === 'BBB') {
  var usbPath = process.env.USBPATH;
  watchdog.watchdog('usb connectivity', {
    monitor: function(callback) {
      common.command("lsusb | grep -i 'Future Technology Devices' | cut -d' ' -f 2,4 | cut -d':' -f 1", __dirname, function(err, data) {
        if (err) {
          console.log('failed to fetch usb status', err);
          return;
        }
        data = data.replace(' ', '/');
        if (!usbPath) {
          usbPath = data;
          console.log("usb path set to " + usbPath);
        } else {
          if (data !== usbPath) {
            console.warn('usb path changed to', data, 'restarting BBB');
            common.command('reboot -f');
          }
        }
      });
    },
    pollPeriod: 60000
  });
}

var kegVolMsgSent = false;

watchdog.watchdog('keg volume', {
  monitor: function(callback) {
    var keg_volume = common.db.kegs.first().volume;

    var consumed_volume = common.db.usage.sum(function(obj) {
      return obj.amount;
    });

    var ml_remain = keg_volume - consumed_volume;
    var perc_remain = (ml_remain / keg_volume) * 100;
    perc_remain = perc_remain.toFixed(2);

    // Make percent remaining configurable or leave at 20%?
    if (kegVolMsgSent === false && perc_remain <= 20) {
      kegVolMsgSent = true;
      callback("Keg volume is running low. Change out soon. Current volume remaing " + ml_remain + " ml, " + perc_remain + "% of keg");
    }
  },
  pollPeriod: 60000
});

/* ************************************************
// END of WATCH DOGs
/* ***********************************************/

lcd.clear();
lcd.print("System online.  Drink up!!!", null);

module.exports = app;
