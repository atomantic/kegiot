var common = require('../lib/common');
module.exports = function(req, res) {
  if (req.params.id) {
    return res.send(common.db.usage.find({
      id: req.params.id
    }));
  }
  res.send(common.db.usage);
};
