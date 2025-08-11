const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Build (Create) Itinerary
router.post('/', async (req, res) => {
  try {
    const { user_id, title, description, start_date, end_date, destinations, activities, cost, information } = req.body;
    const [result] = await db.execute(
      'INSERT INTO itineraries (user_id, title, description, start_date, end_date, destinations, activities, cost, information) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, title, description, start_date, end_date, JSON.stringify(destinations), JSON.stringify(activities), cost || 0, information || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Itinerary created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save as Draft (Update cost/information)
router.patch('/:id', async (req, res) => {
  try {
    const { cost, information } = req.body;
    const [result] = await db.execute(
      'UPDATE itineraries SET cost = ?, information = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [cost, information, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    res.json({ message: 'Itinerary draft updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View (Get) Itinerary by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM itineraries WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    const itinerary = rows[0];
    itinerary.destinations = JSON.parse(itinerary.destinations);
    itinerary.activities = JSON.parse(itinerary.activities);
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all itineraries
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM itineraries');
    // Parse destinations and activities for each itinerary
    const itineraries = rows.map(itinerary => ({
      ...itinerary,
      destinations: JSON.parse(itinerary.destinations),
      activities: JSON.parse(itinerary.activities)
    }));
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
