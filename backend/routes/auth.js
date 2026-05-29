// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getOne, runSql } = require('../db/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'resolvex_default_secret';
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@mitsgwl\.ac\.in$/;

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    enrollment_number: user.enrollment_number || null,
    email: user.email,
    role: user.role,
    department: user.department || null,
    phone: user.phone || null,
    avatar_url: user.avatar_url || null,
    created_at: user.created_at,
  };
}

// ─── POST /api/auth/register ──────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, enrollment_number, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ success: false, message: 'Name must be between 2 and 100 characters.' });
    }

    // Email must be @mitsgwl.ac.in
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email must be a valid MITS email (name@mitsgwl.ac.in).',
      });
    }

    // Password strength
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain an uppercase letter.' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain a lowercase letter.' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain a number.' });
    }

    // Check if email already exists
    const existingEmail = getOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    if (enrollment_number && enrollment_number.trim()) {
      const existingEnrollment = getOne('SELECT id FROM users WHERE enrollment_number = ?', [enrollment_number.trim()]);
      if (existingEnrollment) {
        return res.status(409).json({ success: false, message: 'An account with this enrollment number already exists.' });
      }
    }

    // Create user
    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 12);
    runSql(
      `INSERT INTO users (id, name, enrollment_number, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'student')`,
      [id, name.trim(), enrollment_number?.trim() || null, email.toLowerCase().trim(), password_hash]
    );

    const user = getOne('SELECT * FROM users WHERE id = ?', [id]);
    const token = generateToken(id);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: { user: sanitizeUser(user), token },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, enrollment_number, password } = req.body;

    if ((!email && !enrollment_number) || !password) {
      return res.status(400).json({ success: false, message: 'Email or enrollment number, and password are required.' });
    }

    let user;
    if (enrollment_number && enrollment_number.trim()) {
      user = getOne('SELECT * FROM users WHERE enrollment_number = ?', [enrollment_number.trim()]);
    }
    if (!user && email) {
      user = getOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Role-based email domain validation for admin
    if (user.role === 'admin' && !user.email.endsWith('@mitsgwalior.in')) {
      return res.status(403).json({ success: false, message: 'Unauthorized access. Admin must use @mitsgwalior.in email.' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful.',
      data: { user: sanitizeUser(user), token },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out.' });
});

module.exports = router;
