// 3rd party modules
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
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
var rateLimit = require('./lib/rate_limit');
var rfid = require('./lib/rfid');
var temperature = require('./lib/temperature');
var valve = require('./lib/valve');

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
app.use(require('./lib/app.404'));

// error handlers
app.use(require('./lib/app.error'));

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

server.on('error', require('./lib/server.error'));
server.on('listening', require('./lib/server.listening')(server));

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

require('./lib/watchdog.ip')();
require('./lib/watchdog.temp')();
require('./lib/watchdog.lcd')();
require('./lib/watchdog.usb')();
require('./lib/watchdog.volume')();

/* ************************************************
// END of WATCH DOGs
/* ***********************************************/

lcd.clear();
lcd.print("System online.  Drink up!!!", null);

module.exports = app;
