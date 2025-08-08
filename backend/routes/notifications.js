const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createNotificationValidation = [
  body('type').isIn(['message', 'like', 'follow', 'system', 'promotion']).withMessage('Invalid notification type'),
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority level')
];

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const type = req.query.type; // Filter by type
    const isRead = req.query.is_read; // Filter by read status

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    let queryParams = [userId];

    // Add filters
    if (type) {
      query += ' AND type = ?';
      queryParams.push(type);
    }

    if (isRead !== undefined) {
      query += ' AND is_read = ?';
      queryParams.push(isRead === 'true');
    }

    // Add ordering and pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [notifications] = await pool.execute(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?';
    let countParams = [userId];

    if (type) {
      countQuery += ' AND type = ?';
      countParams.push(type);
    }

    if (isRead !== undefined) {
      countQuery += ' AND is_read = ?';
      countParams.push(isRead === 'true');
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    // Get unread count
    const [unreadResult] = await pool.execute(
      'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount: unreadResult[0].unread
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Private
router.post('/', authenticateToken, createNotificationValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const userId = req.user.id;
    const { type, title, message, priority = 'medium' } = req.body;

    // Create notification
    const [result] = await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
      [userId, type, title, message, priority]
    );

    // Get the created notification
    const [notifications] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Notification created successfully',
      notification: notifications[0]
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 [DEBUG] /read-all - User ID:', userId);
    console.log('🔍 [DEBUG] /read-all - User object:', req.user);

    // Mark all notifications as read
    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );
    
    console.log('🔍 [DEBUG] /read-all - Update result:', result);

    res.json({
      message: 'All notifications marked as read',
      affectedRows: result.affectedRows
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   DELETE /api/notifications/delete-read
// @desc    Delete all read notifications
// @access  Private
router.delete('/delete-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 [DEBUG] /delete-read - User ID:', userId);
    console.log('🔍 [DEBUG] /delete-read - User object:', req.user);

    // Delete all read notifications
    const [result] = await pool.execute(
      'DELETE FROM notifications WHERE user_id = ? AND is_read = TRUE',
      [userId]
    );
    
    console.log('🔍 [DEBUG] /delete-read - Delete result:', result);

    res.json({
      message: `${result.affectedRows} read notifications deleted successfully`
    });

  } catch (error) {
    console.error('Delete read notifications error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   POST /api/notifications/sample
// @desc    Create sample notifications for testing
// @access  Private
router.post('/sample', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Sample notifications for demonstration
    const sampleNotifications = [
      {
        type: 'message',
        title: 'New Message from Sarah',
        message: 'Hey! I wanted to discuss the new project requirements. Are you free tomorrow?',
        priority: 'high'
      },
      {
        type: 'like',
        title: 'Your post is trending!',
        message: 'Alex Chen and 12 others loved your latest design showcase. Great work!',
        priority: 'medium'
      },
      {
        type: 'follow',
        title: 'Emma Wilson started following you',
        message: 'Emma Wilson started following you. She\'s a Senior UX Designer at TechCorp.',
        priority: 'low'
      },
      {
        type: 'system',
        title: 'Weekly Activity Report',
        message: 'Your weekly activity report is ready. You\'ve completed 15 tasks this week.',
        priority: 'medium'
      },
      {
        type: 'promotion',
        title: 'Limited Time Offer - 50% off Pro Plan',
        message: 'Upgrade to NexaUI Pro today and get 50% off for the first 3 months!',
        priority: 'high'
      }
    ];

    // Create sample notifications
    for (const notification of sampleNotifications) {
      await pool.execute(
        'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
        [userId, notification.type, notification.title, notification.message, notification.priority]
      );
    }

    res.json({
      message: 'Sample notifications created successfully',
      count: sampleNotifications.length
    });

  } catch (error) {
    console.error('Create sample notifications error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   GET /api/notifications/:id
// @desc    Get a specific notification
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const [notifications] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({ 
        error: 'Notification not found' 
      });
    }

    res.json({
      notification: notifications[0]
    });

  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   PUT /api/notifications/:id
// @desc    Update a notification
// @access  Private
router.put('/:id', authenticateToken, createNotificationValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const notificationId = req.params.id;
    const userId = req.user.id;
    const { type, title, message, priority } = req.body;

    // Check if notification exists and belongs to user
    const [existingNotifications] = await pool.execute(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (existingNotifications.length === 0) {
      return res.status(404).json({ 
        error: 'Notification not found' 
      });
    }

    // Update notification
    await pool.execute(
      'UPDATE notifications SET type = ?, title = ?, message = ?, priority = ? WHERE id = ?',
      [type, title, message, priority, notificationId]
    );

    // Get updated notification
    const [notifications] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ?',
      [notificationId]
    );

    res.json({
      message: 'Notification updated successfully',
      notification: notifications[0]
    });

  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const [existingNotifications] = await pool.execute(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (existingNotifications.length === 0) {
      return res.status(404).json({ 
        error: 'Notification not found' 
      });
    }

    // Delete notification
    await pool.execute(
      'DELETE FROM notifications WHERE id = ?',
      [notificationId]
    );

    res.json({
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const [existingNotifications] = await pool.execute(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (existingNotifications.length === 0) {
      return res.status(404).json({ 
        error: 'Notification not found' 
      });
    }

    // Mark as read
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    );

    res.json({
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

module.exports = router; 