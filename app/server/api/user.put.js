var common = require('../lib/common');
module.exports = function(req, res) {
    var item = common.db.users.find({id: req.params.id});
    if(!item){
        console.log('creating user', req.body);
        // create
        common.db.users.push(req.body);
        return res.send(req.body);
    }
    console.log('update user', req.body);
    // update
    var newItem = common.db.users.chain().find({id: req.params.id}).assign(req.body).value();
    res.send(newItem);
};
