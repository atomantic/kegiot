var common = require('../lib/common');
module.exports = function(req, res) {
    var item = common.db.configs.find({id: req.params.id});
    if(!item){
        console.log('creating', req.body);
        // create
        common.db.configs.push(req.body);
        return res.send(req.body);
    }
    console.log('update', req.body);
    // update
    var newItem = common.db.configs.chain().find({id: req.params.id}).assign(req.body).value();
    res.send(newItem);
};
