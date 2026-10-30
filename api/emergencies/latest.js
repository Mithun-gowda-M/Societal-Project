const handler = require('../index.js');

module.exports = (req, res) => {
  req.url = '/api/emergencies/latest';
  return handler(req, res);
};
