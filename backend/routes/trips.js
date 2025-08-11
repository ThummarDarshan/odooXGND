const express = require('express');
const router = express.Router();
const { pool } = require('../config/database'); // FIX: import pool
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/trip-covers');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'trip_' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware to require authentication (simple version)
function requireAuth(req, res, next) {
  // You may want to use your real auth middleware here
  const user = req.user || req.body.user || req.query.user;
  if (!user || !user.id) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}

// Create a new trip (now requires authentication)
router.post('/', authenticateToken, upload.single('cover'), async (req, res) => {
  // Debug: log all received fields
  console.log('Received fields:', req.body);
  // Debug: log all received fields and their types
  Object.entries(req.body).forEach(([key, value]) => {
    console.log(`Field: ${key}, Value: ${value}, Type: ${typeof value}`);
  });
  const { name, location, start_date, end_date, description, cost } = req.body;
  const user_id = req.user.id; // Get user id from token
  if (!name || !location || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields', received: req.body });
  }
  const cover = req.file ? '/uploads/trip-covers/' + req.file.filename : null;
  const sql = `INSERT INTO trips (user_id, name, location, start_date, end_date, description, cover, cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  try {
    const [result] = await pool.query(sql, [user_id, name, location, start_date, end_date, description, cover, cost || 0]);
    res.status(201).json({ id: result.insertId, name, location, start_date, end_date, description, cover, cost: cost || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all trips for a user
router.get('/user/:user_id', async (req, res) => { // FIX: async handler
  const { user_id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM trips WHERE user_id = ?', [user_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single trip
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM trips WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Trip not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a trip (basic, no file upload)
router.put('/:id', async (req, res) => {
  const { name, location, start_date, end_date, description, cost } = req.body;
  try {
    await pool.query('UPDATE trips SET name=?, location=?, start_date=?, end_date=?, description=?, cost=? WHERE id=?',
      [name, location, start_date, end_date, description, cost, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a trip
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM trips WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
