const handler = require('../index.js');

module.exports = (req, res) => {
  req.url = '/api/auth/register';
  return handler(req, res);
};
