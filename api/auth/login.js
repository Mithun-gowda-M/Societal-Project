const handler = require('../index.js');

module.exports = (req, res) => {
  req.url = '/api/auth/login';
  return handler(req, res);
};
