var common = require('../lib/common');
module.exports = function(req, res) {
    var item = common.db.kegs.find({id: req.params.id});
    if(!item){
        console.log('creating keg', req.body);
        // create
        common.db.kegs.push(req.body);
        return res.send(req.body);
    }
    console.log('update keg', req.body);
    // update
    var newItem = common.db.kegs.chain().find({id: req.params.id}).assign(req.body).value();
    res.send(newItem);
};
