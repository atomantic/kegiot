var common = require('../lib/common');
module.exports = function(req, res) {
  res.send(common.db.configs.find({id: req.params.id}));
};
