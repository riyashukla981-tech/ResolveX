// routes/complaints.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getOne, getAll, runSql, getScalar } = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// ─── Multer Config for Image Upload ──────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `complaint-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, GIF, and WebP images are allowed.'));
    }
  },
});

// ─── Generate Complaint ID ───────────────────────────────────
function generateComplaintId() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RX-${year}${month}-${rand}`;
}

// All complaint routes require authentication
router.use(authenticate);

// ─── POST /api/complaints/create ─────────────────────────────
router.post('/create', upload.single('image'), (req, res) => {
  try {
    const { title, description, category, is_anonymous } = req.body;
    const studentId = req.user.id;

    if (!title || title.length < 5) {
      return res.status(400).json({ success: false, message: 'Title must be at least 5 characters.' });
    }
    if (!description || description.length < 20) {
      return res.status(400).json({ success: false, message: 'Description must be at least 20 characters.' });
    }
    const validCategories = ['Infrastructure', 'Academic', 'Hostel', 'Canteen', 'Others'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const id = uuidv4();
    const complaint_id = generateComplaintId();
    const isAnon = is_anonymous === 'true' || is_anonymous === true ? 1 : 0;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    runSql(
      `INSERT INTO complaints (id, complaint_id, title, description, category, image_url, status, is_anonymous, student_id)
       VALUES (?, ?, ?, ?, ?, ?, 'Submitted', ?, ?)`,
      [id, complaint_id, title.trim(), description.trim(), category, image_url, isAnon, studentId]
    );

    // Add history entry
    const historyId = uuidv4();
    runSql(
      `INSERT INTO complaint_history (id, complaint_id, changed_by, new_status, action)
       VALUES (?, ?, ?, 'Submitted', 'Complaint submitted')`,
      [historyId, id, studentId]
    );

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: { id, complaint_id },
    });
  } catch (err) {
    console.error('Create complaint error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── GET /api/complaints/stats (Admin) ───────────────────────
router.get('/stats', authorize('admin'), (req, res) => {
  try {
    const total = getScalar('SELECT COUNT(*) FROM complaints', []) || 0;

    const pending = getScalar(
      "SELECT COUNT(*) FROM complaints WHERE status IN ('Submitted', 'Under Review')", []
    ) || 0;

    const recentWeek = getScalar(
      "SELECT COUNT(*) FROM complaints WHERE created_at >= datetime('now', '-7 days')", []
    ) || 0;

    // By status
    const statusRows = getAll('SELECT status, COUNT(*) as count FROM complaints GROUP BY status', []);
    const byStatus = {
      'Submitted': 0, 'Under Review': 0, 'In Progress': 0, 'Resolved': 0, 'Closed': 0,
    };
    statusRows.forEach((r) => { byStatus[r.status] = r.count; });

    // By category
    const categoryRows = getAll('SELECT category, COUNT(*) as count FROM complaints GROUP BY category', []);
    const byCategory = {
      'Infrastructure': 0, 'Academic': 0, 'Hostel': 0, 'Canteen': 0, 'Others': 0,
    };
    categoryRows.forEach((r) => { byCategory[r.category] = r.count; });

    res.json({
      success: true,
      data: { total, pending, recentWeek, byStatus, byCategory },
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── GET /api/complaints/user ────────────────────────────────
router.get('/user', (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    const { status, category } = req.query;

    let where = 'WHERE c.student_id = ?';
    const params = [userId];

    if (status) {
      where += ' AND c.status = ?';
      params.push(status);
    }
    if (category) {
      where += ' AND c.category = ?';
      params.push(category);
    }

    const total = getScalar(`SELECT COUNT(*) FROM complaints c ${where}`, params) || 0;

    const complaints = getAll(
      `SELECT c.*, u.name as student_name, u.email as student_email, u.department as student_department
       FROM complaints c
       LEFT JOIN users u ON c.student_id = u.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formatted = complaints.map(formatComplaint);

    res.json({
      success: true,
      data: {
        complaints: formatted,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
      },
    });
  } catch (err) {
    console.error('User complaints error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── GET /api/complaints/all (Admin) ─────────────────────────
router.get('/all', authorize('admin'), (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));
    const offset = (page - 1) * limit;
    const { status, category, search } = req.query;

    let where = 'WHERE 1=1';
    const params = [];

    if (status) {
      where += ' AND c.status = ?';
      params.push(status);
    }
    if (category) {
      where += ' AND c.category = ?';
      params.push(category);
    }
    if (search) {
      where += ' AND (c.title LIKE ? OR c.complaint_id LIKE ? OR c.description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const total = getScalar(`SELECT COUNT(*) FROM complaints c ${where}`, params) || 0;

    const complaints = getAll(
      `SELECT c.*, u.name as student_name, u.email as student_email, u.department as student_department
       FROM complaints c
       LEFT JOIN users u ON c.student_id = u.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formatted = complaints.map(formatComplaint);

    res.json({
      success: true,
      data: {
        complaints: formatted,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
      },
    });
  } catch (err) {
    console.error('All complaints error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── GET /api/complaints/:id ─────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const complaint = getOne(
      `SELECT c.*, u.name as student_name, u.email as student_email, u.department as student_department
       FROM complaints c
       LEFT JOIN users u ON c.student_id = u.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Check access: student can only see their own, admin can see all
    if (req.user.role === 'student' && complaint.student_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Get history
    const history = getAll(
      `SELECT h.*, u.name as changed_by_name, u.role as changed_by_role
       FROM complaint_history h
       LEFT JOIN users u ON h.changed_by = u.id
       WHERE h.complaint_id = ?
       ORDER BY h.created_at ASC`,
      [req.params.id]
    );

    const formatted = formatComplaint(complaint);
    formatted.history = history.map((h) => ({
      id: h.id,
      complaint_id: h.complaint_id,
      changed_by: h.changed_by,
      changed_by_user: h.changed_by_name ? { name: h.changed_by_name, role: h.changed_by_role } : null,
      old_status: h.old_status,
      new_status: h.new_status,
      remarks: h.remarks,
      action: h.action,
      created_at: h.created_at,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('Complaint detail error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── PATCH /api/complaints/:id/status (Admin) ────────────────
router.patch('/:id/status', authorize('admin'), (req, res) => {
  try {
    const { status, admin_remarks } = req.body;
    const complaintId = req.params.id;

    const validStatuses = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const complaint = getOne('SELECT * FROM complaints WHERE id = ?', [complaintId]);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const oldStatus = complaint.status;
    const now = new Date().toISOString();
    const resolvedAt = status === 'Resolved' ? now : complaint.resolved_at;

    runSql(
      `UPDATE complaints SET status = ?, admin_remarks = ?, resolved_at = ?, updated_at = ? WHERE id = ?`,
      [status, admin_remarks || complaint.admin_remarks, resolvedAt, now, complaintId]
    );

    // Add history
    const historyId = uuidv4();
    const action = oldStatus !== status
      ? `Status changed from "${oldStatus}" to "${status}"`
      : 'Admin remarks updated';

    runSql(
      `INSERT INTO complaint_history (id, complaint_id, changed_by, old_status, new_status, remarks, action)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [historyId, complaintId, req.user.id, oldStatus, status, admin_remarks || null, action]
    );

    res.json({ success: true, message: 'Complaint updated successfully.' });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── PATCH /api/complaints/:id/assign (Admin) ────────────────
router.patch('/:id/assign', authorize('admin'), (req, res) => {
  try {
    const { department } = req.body;
    const complaintId = req.params.id;

    if (!department) {
      return res.status(400).json({ success: false, message: 'Department is required.' });
    }

    const complaint = getOne('SELECT * FROM complaints WHERE id = ?', [complaintId]);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const now = new Date().toISOString();
    runSql(
      `UPDATE complaints SET assigned_department = ?, updated_at = ? WHERE id = ?`,
      [department, now, complaintId]
    );

    // Add history
    const historyId = uuidv4();
    runSql(
      `INSERT INTO complaint_history (id, complaint_id, changed_by, action, remarks)
       VALUES (?, ?, ?, ?, ?)`,
      [historyId, complaintId, req.user.id, `Assigned to department: ${department}`, null]
    );

    res.json({ success: true, message: 'Department assigned successfully.' });
  } catch (err) {
    console.error('Assign error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── Helper: Format complaint from DB row ────────────────────
function formatComplaint(row) {
  return {
    id: row.id,
    complaint_id: row.complaint_id,
    title: row.title,
    description: row.description,
    category: row.category,
    image_url: row.image_url,
    status: row.status,
    is_anonymous: row.is_anonymous === 1,
    student_id: row.student_id,
    student: row.student_name ? {
      id: row.student_id,
      name: row.student_name,
      email: row.student_email,
      department: row.student_department,
    } : null,
    assigned_department: row.assigned_department,
    admin_remarks: row.admin_remarks,
    resolved_at: row.resolved_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

module.exports = router;
