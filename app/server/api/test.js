var common = require('../lib/common');
var _ = require('../lib/_');
module.exports = function(req, res) {
  common.db.usage.map(function(item) {
    if (!item.id) {
      item.id = _.uuid();
    }
    return item;
  });
  res.send(common.db.usage);
};
