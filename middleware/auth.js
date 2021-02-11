const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check the existance of token
  if (!token) {
    return res.status(401).json({ errors: 'No token, authorization denied' });
  }

  // Verify token and extract payload
  try {
    const decoded = jwt.verify(token, config.get('privateKey'));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ errors: 'Token is not valid' });
  }
};
