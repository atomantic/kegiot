module.exports = function(err, req, res) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err
  });
};
