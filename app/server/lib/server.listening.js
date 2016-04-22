var debug = require('debug')('myapp:server');
module.exports = function(server){
  return function() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    debug('Listening on ' + bind);
  };
}
