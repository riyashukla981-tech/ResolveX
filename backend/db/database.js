// db/database.js
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.resolve(__dirname, '..', process.env.DB_PATH || './db/resolvex.db');

// Ensure the directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

let db = null;

// Save database to disk
function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// Auto-save every 5 seconds
let saveInterval = null;

async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // ─── Create Tables ────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      enrollment_number TEXT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student', 'admin')),
      department TEXT,
      phone TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Migration: add enrollment_number if missing (for existing databases)
  try {
    db.run('ALTER TABLE users ADD COLUMN enrollment_number TEXT');
  } catch (e) {
    // Column already exists, ignore
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      complaint_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Infrastructure', 'Academic', 'Hostel', 'Canteen', 'Others')),
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'Submitted' CHECK(status IN ('Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed')),
      is_anonymous INTEGER NOT NULL DEFAULT 0,
      student_id TEXT NOT NULL,
      assigned_department TEXT,
      admin_remarks TEXT,
      resolved_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS complaint_history (
      id TEXT PRIMARY KEY,
      complaint_id TEXT NOT NULL,
      changed_by TEXT,
      old_status TEXT,
      new_status TEXT,
      remarks TEXT,
      action TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (complaint_id) REFERENCES complaints(id),
      FOREIGN KEY (changed_by) REFERENCES users(id)
    )
  `);

  // Create indexes
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_complaints_student_id ON complaints(student_id)',
    'CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)',
    'CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category)',
    'CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_complaint_history_complaint_id ON complaint_history(complaint_id)',
  ];
  indexes.forEach((sql) => db.run(sql));

  // ─── Seed Default Admin ───────────────────────────────────────
  const adminCheck = db.exec("SELECT id FROM users WHERE email = 'admin@mitsgwl.ac.in'");
  if (adminCheck.length === 0 || adminCheck[0].values.length === 0) {
    const adminId = uuidv4();
    const hash = bcrypt.hashSync('Admin@123', 12);
    db.run(
      `INSERT INTO users (id, name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, 'System Administrator', 'admin@mitsgwl.ac.in', hash, 'admin', 'Administration']
    );
    console.log('✅ Default admin seeded: admin@mitsgwl.ac.in / Admin@123');
  }

  // ─── Seed Riya Admin ───────────────────────────────────────
  const riyaCheck = db.exec("SELECT id FROM users WHERE email = 'riyashukla@mitsgwalior.in'");
  if (riyaCheck.length === 0 || riyaCheck[0].values.length === 0) {
    const riyaId = uuidv4();
    const hash = bcrypt.hashSync('RiyaAdmin@123', 12);
    db.run(
      `INSERT INTO users (id, name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?, ?)`,
      [riyaId, 'Riya Shukla', 'riyashukla@mitsgwalior.in', hash, 'admin', 'Administration']
    );
    console.log('✅ Admin seeded: riyashukla@mitsgwalior.in / RiyaAdmin@123');
  }

  // Save to disk
  saveDb();

  // Auto-save periodically
  saveInterval = setInterval(saveDb, 5000);

  console.log('✅ Database initialized at:', DB_PATH);
  return db;
}

// ─── Helper wrappers for consistent API ──────────────────────

/**
 * Get a single row. Returns object or undefined.
 */
function getOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const cols = stmt.getColumnNames();
    const vals = stmt.get();
    stmt.free();
    const row = {};
    cols.forEach((col, i) => { row[col] = vals[i]; });
    return row;
  }
  stmt.free();
  return undefined;
}

/**
 * Get all rows. Returns array of objects.
 */
function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  const cols = stmt.getColumnNames();
  while (stmt.step()) {
    const vals = stmt.get();
    const row = {};
    cols.forEach((col, i) => { row[col] = vals[i]; });
    rows.push(row);
  }
  stmt.free();
  return rows;
}

/**
 * Run a statement (INSERT, UPDATE, DELETE). Returns { changes }.
 */
function runSql(sql, params = []) {
  db.run(sql, params);
  saveDb();
  return { changes: db.getRowsModified() };
}

/**
 * Get a scalar value from a query
 */
function getScalar(sql, params = []) {
  const result = db.exec(sql, params);
  if (result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0];
  }
  return null;
}

module.exports = {
  initDatabase,
  getOne,
  getAll,
  runSql,
  getScalar,
  saveDb,
  getDb: () => db,
};
