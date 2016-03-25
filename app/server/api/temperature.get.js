var temperature = require('../lib/temperature');
module.exports = function(req, res) {
    temperature.readTemperature(function(temp){
        res.send({
            temperature: temp
        });
    });
};
