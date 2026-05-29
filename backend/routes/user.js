// routes/user.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { getOne, runSql } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// ─── PUT /api/user/profile ────────────────────────────────────
router.put('/profile', (req, res) => {
  try {
    const { name, enrollment_number, phone, department } = req.body;
    const userId = req.user.id;

    if (!name || name.length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    }

    runSql(
      `UPDATE users SET name = ?, enrollment_number = ?, phone = ?, department = ? WHERE id = ?`,
      [name.trim(), enrollment_number?.trim() || null, phone?.trim() || null, department?.trim() || null, userId]
    );

    const user = getOne(
      'SELECT id, name, enrollment_number, email, role, department, phone, avatar_url, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: user,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── PUT /api/user/change-password ────────────────────────────
router.put('/change-password', async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }
    if (!/[A-Z]/.test(new_password)) {
      return res.status(400).json({ success: false, message: 'New password must contain an uppercase letter.' });
    }
    if (!/[a-z]/.test(new_password)) {
      return res.status(400).json({ success: false, message: 'New password must contain a lowercase letter.' });
    }
    if (!/[0-9]/.test(new_password)) {
      return res.status(400).json({ success: false, message: 'New password must contain a number.' });
    }

    const user = getOne('SELECT password_hash FROM users WHERE id = ?', [userId]);
    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const hash = await bcrypt.hash(new_password, 12);
    runSql('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
