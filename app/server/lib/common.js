var low = require('lowdb');
var lowConfig = {
  storage: require('lowdb/file-sync')
};
var path = require('path');
// var request = require('request');
var _ = require('./_');
var exec = require('child_process').exec;
var dbUsers = low(path.join(__dirname, '../data/users.json'), lowConfig);
var dbKegs = low(path.join(__dirname, '../data/kegs.json'), lowConfig);
var dbUsage = low(path.join(__dirname, '../data/usage.json'), lowConfig);
var dbConfigs = low(path.join(__dirname, '../data/configs.json'), lowConfig);
var dbNetwork = low(path.join(__dirname, '../data/network.json'), lowConfig);
var common = {
  db: {
    users: dbUsers('users'),
    kegs: dbKegs('kegs'),
    usage: dbUsage('usage'),
    configs: dbConfigs('configs'),
    network: dbNetwork('network')
  },
  /**
   * run a system command
    common.command('git checkout qa', __dirname, function (err, out) {
      // continue, do stuff, callback(), etc
    });
   */
  command: function(cmd, dir, cb) {
    exec(cmd, {
      cwd: dir || __dirname
    }, function(err, stdout, stderr) {
      if (err) {
        console.error(err, stdout, stderr);
      }
      if (_.isFunction(cb)) cb(err, stdout.split('\n').join(''));
    });
  },
  getConfig: function(name) {
    var item = common.db.configs.find({
      name: name
    });
    if (!item) {
      console.error('no config for ', name);
      console.log(common.db.configs.map());
      return '';
    }
    return item.value;
  },
  requireAdmin: function(req, res, next) {
    next();

  // var sessionCookieName = common.getConfig('session_cookie_name');
  // var err = new Error('Not Authorized');
  // err.status = 401;
  // if (!req.cookies[sessionCookieName]) {
  //   return next(err);
  // }
  // request(common.getConfig('session_service') + req.cookies[sessionCookieName], function(error, response, body) {
  //   var userId = _.get(JSON.parse(body), 'requester.identifier');
  //   // console.log(userId, db('users').find({id: userId}));
  //   if (!userId && !common.db.users.find({
  //       id: userId
  //     })) {
  //     next(err);
  //   }
  //   next();
  // });
  },
  stringToBytes: function(str) {
    var bytes = '';
    for (var i = 0; i < str.length; i++) {
      bytes += ' 0x' + str.charCodeAt(i).toString(16);
    }
    // console.log('bytes created: ', str, bytes);
    return bytes;
  }
};
module.exports = common;
