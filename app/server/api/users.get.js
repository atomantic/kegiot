var common = require('../lib/common');
/* GET users listing. */

module.exports = function(req, res) {
  res.send(common.db.users.map());
};
