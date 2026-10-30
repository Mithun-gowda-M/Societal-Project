const handler = require('../index.js');

module.exports = (req, res) => {
  req.url = '/api/auth/resend-otp';
  return handler(req, res);
};
