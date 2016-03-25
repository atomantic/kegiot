var common = require('../lib/common');
module.exports = function(req, res) {
  var item = common.db.usage.find({
    id: req.params.id
  });
  if (!item) {
    var err = new Error('Not Found');
    err.status = 404;
    return res.send(err);
  }
  common.db.usage.remove({
    id: req.params.id
  });
  res.send({});
};
