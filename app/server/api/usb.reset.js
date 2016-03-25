var usb = require('../lib/usb');
module.exports = function(req, res) {
  usb.reset(function(err, status) {
    res.send({
      err: err,
      status: status
    });
  });
};
