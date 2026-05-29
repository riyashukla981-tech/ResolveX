// middleware/auth.js
const jwt = require('jsonwebtoken');
const { getOne } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'resolvex_default_secret';

/**
 * Verify JWT token and attach user to req.user
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = getOne(
      'SELECT id, name, enrollment_number, email, role, department, phone, avatar_url, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/**
 * Require specific role(s)
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
