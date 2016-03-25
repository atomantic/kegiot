var lcd = require('../lib/lcd');
module.exports = function(req, res) {
    var line = req.body.line;
    var str = req.body.value;
    console.log("--LCD ADMIN--", line, str);
    lcd.setRow(line, function(){
      lcd.print(str, function(){
        console.log('--LCD ADMIN--print complete');
      });
    });

    res.send({status: 'ok'});
};
