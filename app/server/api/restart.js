var restart = require('../lib/restart');
module.exports = function(req, res) {
  restart.now();
  res.send({
    message: 'restart sent'
  });
};
