var common = require('../lib/common');
module.exports = function(req, res) {
  console.log('update usage', req.body);
  // update
  var newItem = common.db.usage.chain().find({
    id: req.params.id
  }).assign(req.body).value();
  res.send(newItem);
};
