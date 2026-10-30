const handler = require('../index.js');

module.exports = (req, res) => {
  req.url = '/api/communications/status';
  return handler(req, res);
};
