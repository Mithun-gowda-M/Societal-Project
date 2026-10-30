const handler = require('../index.js');

module.exports = (req, res) => {
  req.url = '/api/emergencies/broadcast';
  return handler(req, res);
};
