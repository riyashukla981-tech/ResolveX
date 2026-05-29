// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ResolveX API is running.', timestamp: new Date().toISOString() });
});

// ─── Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
  }
  if (err.message && err.message.includes('Only')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start Server ────────────────────────────────────────────
async function start() {
  try {
    // Initialize database first (async with sql.js)
    await initDatabase();
    console.log('✅ Database ready');

    // Mount routes AFTER database is initialized
    const authRoutes = require('./routes/auth');
    const userRoutes = require('./routes/user');
    const complaintRoutes = require('./routes/complaints');

    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/complaints', complaintRoutes);

    // Error handler must be after routes
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
      }
      res.status(500).json({ success: false, message: 'Internal server error.' });
    });

    app.listen(PORT, () => {
      console.log(`\n🚀 ResolveX API server running on http://localhost:${PORT}`);
      console.log(`📁 Database stored at: ${process.env.DB_PATH || './db/resolvex.db'}`);
      console.log(`🔑 Admin login: admin@mitsgwl.ac.in / Admin@123\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
