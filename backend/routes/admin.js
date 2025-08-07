const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { pool } = require('../config/database');
const { body, validationResult } = require('express-validator');
const { convertNamesToTitleCase } = require('../utils/stringUtils');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users count
    const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    
    // Get verified users count
    const [verifiedUsers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "user" AND is_verified = 1');
    
    // Get unverified users count
    const [unverifiedUsers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "user" AND is_verified = 0');
    
    // Get recent registrations (last 7 days)
    const [recentRegistrations] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "user" AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );
    
    // Get total notifications count
    const [totalNotifications] = await pool.execute('SELECT COUNT(*) as count FROM notifications');
    
    // Get recent activity (last 10 notifications)
    const [recentActivity] = await pool.execute(`
      SELECT n.*, u.first_name, u.last_name, u.email 
      FROM notifications n 
      JOIN users u ON n.user_id = u.id 
      ORDER BY n.created_at DESC 
      LIMIT 10
    `);

    res.json({
      stats: {
        totalUsers: totalUsers[0].count,
        verifiedUsers: verifiedUsers[0].count,
        unverifiedUsers: unverifiedUsers[0].count,
        recentRegistrations: recentRegistrations[0].count,
        totalNotifications: totalNotifications[0].count
      },
      recentActivity
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Admin only
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', role = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    if (search) {
      whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status === 'verified') {
      whereClause += ' AND is_verified = 1';
    } else if (status === 'unverified') {
      whereClause += ' AND is_verified = 0';
    }
    
    if (role === 'admin') {
      whereClause += ' AND role = "admin"';
    } else if (role === 'user') {
      whereClause += ' AND role = "user"';
    }
    
    // Get total count
    const [totalCount] = await pool.execute(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      params
    );
    
    // Get users with pagination
    const [users] = await pool.execute(
      `SELECT id, first_name, last_name, email, role, is_verified, is_enabled, reactivation_requested, created_at, updated_at 
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount[0].count / limit),
        totalItems: totalCount[0].count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get specific user details
// @access  Admin only
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await pool.execute(`
      SELECT u.*, up.phone, up.location, up.website, up.social_links, up.preferences
      FROM users u 
      LEFT JOIN user_profiles up ON u.id = up.user_id 
      WHERE u.id = ?
    `, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's notifications
    const [notifications] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [id]
    );
    
    res.json({
      user: users[0],
      notifications
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user verification status
// @access  Admin only
router.put('/users/:id/status', [
  body('is_verified').isBoolean().withMessage('is_verified must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    
    const { id } = req.params;
    const { is_verified } = req.body;
    
    // Check if user exists
    const [users] = await pool.execute('SELECT id, first_name, last_name FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user status
    await pool.execute('UPDATE users SET is_verified = ? WHERE id = ?', [is_verified, id]);
    
    // Create notification for user
    const statusText = is_verified ? 'verified' : 'unverified';
    await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
      [id, 'system', 'Account Status Updated', `Your account has been ${statusText} by an administrator.`, 'high']
    );
    
    res.json({ 
      message: `User ${statusText} successfully`,
      user: { id, is_verified }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/admin/users/:id/enable
// @desc    Toggle user enabled status
// @access  Admin only
router.put('/users/:id/enable', [
  body('is_enabled').isBoolean().withMessage('is_enabled must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    
    const { id } = req.params;
    const { is_enabled } = req.body;
    
    // Check if user exists
    const [users] = await pool.execute('SELECT id, first_name, last_name FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user enabled status
    await pool.execute('UPDATE users SET is_enabled = ? WHERE id = ?', [is_enabled, id]);
    
    // Create notification for user
    const statusText = is_enabled ? 'enabled' : 'disabled';
    await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
      [id, 'system', 'Account Status Updated', `Your account has been ${statusText} by an administrator.`, 'high']
    );
    
    res.json({ 
      message: `User ${statusText} successfully`,
      user: { id, is_enabled }
    });
  } catch (error) {
    console.error('Update user enabled status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (soft delete by setting is_verified to false)
// @access  Admin only
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [users] = await pool.execute('SELECT id, first_name, last_name, role FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    // Soft delete by setting is_verified to false
    await pool.execute('UPDATE users SET is_verified = 0 WHERE id = ?', [id]);
    
    // Create notification for user
    await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
      [id, 'system', 'Account Disabled', 'Your account has been disabled by an administrator. Please contact support for assistance.', 'high']
    );
    
    res.json({ 
      message: 'User disabled successfully',
      user: { id, first_name: user.first_name, last_name: user.last_name }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin only
router.put('/users/:id/role', [
  body('role').isIn(['user', 'admin']).withMessage('Role must be either user or admin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    
    const { id } = req.params;
    const { role } = req.body;
    
    // Check if user exists
    const [users] = await pool.execute('SELECT id, first_name, last_name FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user role
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    
    // Create notification for user
    await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
      [id, 'system', 'Role Updated', `Your account role has been updated to ${role}.`, 'high']
    );
    
    res.json({ 
      message: `User role updated to ${role} successfully`,
      user: { id, role }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/admin/notifications
// @desc    Get all notifications with pagination
// @access  Admin only
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 20, type = '', priority = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }
    
    if (priority) {
      whereClause += ' AND priority = ?';
      params.push(priority);
    }
    
    // Get total count
    const [totalCount] = await pool.execute(
      `SELECT COUNT(*) as count FROM notifications ${whereClause}`,
      params
    );
    
    // Get notifications with user info
    const [notifications] = await pool.execute(
      `SELECT n.*, u.first_name, u.last_name, u.email 
       FROM notifications n 
       JOIN users u ON n.user_id = u.id 
       ${whereClause} 
       ORDER BY n.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    res.json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount[0].count / limit),
        totalItems: totalCount[0].count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/admin/notifications
// @desc    Send notification to specific user or all users
// @access  Admin only
router.post('/notifications', [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('type').isIn(['message', 'like', 'follow', 'system', 'promotion']).withMessage('Invalid notification type'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    
    const { title, message, type, priority, user_id, send_to_all } = req.body;
    
    if (send_to_all) {
      // Send to all verified users
      const [users] = await pool.execute('SELECT id FROM users WHERE is_verified = 1');
      
      for (const user of users) {
        await pool.execute(
          'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
          [user.id, type, title, message, priority]
        );
      }
      
      res.json({ 
        message: `Notification sent to ${users.length} users`,
        sentTo: users.length
      });
    } else if (user_id) {
      // Send to specific user
      const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [user_id]);
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      await pool.execute(
        'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
        [user_id, type, title, message, priority]
      );
      
      res.json({ 
        message: 'Notification sent successfully',
        sentTo: 1
      });
    } else {
      return res.status(400).json({ error: 'Either user_id or send_to_all must be provided' });
    }
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/admin/profile
// @desc    Get admin profile
// @access  Admin only
router.get('/profile', async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT u.*, up.phone, up.location, up.website, up.social_links, up.preferences
      FROM users u 
      LEFT JOIN user_profiles up ON u.id = up.user_id 
      WHERE u.id = ?
    `, [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Admin profile not found' });
    }
    
    res.json({ admin: users[0] });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/admin/profile
// @desc    Update admin profile
// @access  Admin only
router.put('/profile', [
  body('first_name').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters'),
  body('last_name').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters'),
  body('phone').optional().isLength({ max: 30 }).withMessage('Phone number too long'),
  body('location').optional().isLength({ max: 255 }).withMessage('Location too long'),
  body('website').optional().isURL().withMessage('Invalid website URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    
    const { first_name, last_name, phone, location, website, social_links, preferences } = req.body;
    
    // Convert first name and last name to title case if provided
    let titleCaseFirstName = first_name;
    let titleCaseLastName = last_name;
    
    if (first_name || last_name) {
      const convertedNames = convertNamesToTitleCase(first_name || '', last_name || '');
      titleCaseFirstName = convertedNames.titleCaseFirstName;
      titleCaseLastName = convertedNames.titleCaseLastName;
    }
    
    // Update user table
    if (first_name || last_name) {
      const updateFields = [];
      const updateValues = [];
      
      if (first_name) {
        updateFields.push('first_name = ?');
        updateValues.push(titleCaseFirstName);
      }
      if (last_name) {
        updateFields.push('last_name = ?');
        updateValues.push(titleCaseLastName);
      }
      
      updateValues.push(req.user.id);
      await pool.execute(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
    }
    
    // Update or create user profile
    const [existingProfile] = await pool.execute('SELECT id FROM user_profiles WHERE user_id = ?', [req.user.id]);
    
    if (existingProfile.length > 0) {
      // Update existing profile
      await pool.execute(
        'UPDATE user_profiles SET phone = ?, location = ?, website = ?, social_links = ?, preferences = ? WHERE user_id = ?',
        [phone, location, website, JSON.stringify(social_links), JSON.stringify(preferences), req.user.id]
      );
    } else {
      // Create new profile
      await pool.execute(
        'INSERT INTO user_profiles (user_id, phone, location, website, social_links, preferences) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, phone, location, website, JSON.stringify(social_links), JSON.stringify(preferences)]
      );
    }
    
    // Get updated profile
    const [users] = await pool.execute(`
      SELECT u.*, up.phone, up.location, up.website, up.social_links, up.preferences
      FROM users u 
      LEFT JOIN user_profiles up ON u.id = up.user_id 
      WHERE u.id = ?
    `, [req.user.id]);
    
    res.json({ 
      message: 'Admin profile updated successfully',
      admin: users[0]
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/admin/reactivation-requests
// @desc    Get all reactivation requests
// @access  Admin only
router.get('/reactivation-requests', async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT id, first_name, last_name, email, role, is_verified, is_enabled, reactivation_requested, created_at
      FROM users 
      WHERE reactivation_requested = 1 AND is_enabled = 0
      ORDER BY created_at DESC
    `);
    
    res.json({ requests: users });
  } catch (error) {
    console.error('Get reactivation requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/admin/reactivation-requests/:id/approve
// @desc    Approve a reactivation request
// @access  Admin only
router.put('/reactivation-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user details
    const [users] = await pool.execute(
      'SELECT id, first_name, last_name, email, reactivation_requested, is_enabled FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    if (!user.reactivation_requested) {
      return res.status(400).json({ error: 'No reactivation request found for this user' });
    }
    
    if (user.is_enabled) {
      return res.status(400).json({ error: 'User is already enabled' });
    }
    
    // Enable user and clear reactivation request
    await pool.execute(
      'UPDATE users SET is_enabled = 1, reactivation_requested = 0 WHERE id = ?',
      [id]
    );
    
    // Create notification for user
    await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
      [id, 'system', 'Account Reactivated', 'Your account has been reactivated by an administrator. You can now log in.', 'high']
    );
    
    res.json({ 
      message: 'Reactivation request approved successfully',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Approve reactivation request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/admin/reactivation-requests/:id/reject
// @desc    Reject a reactivation request
// @access  Admin only
router.put('/reactivation-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user details
    const [users] = await pool.execute(
      'SELECT id, first_name, last_name, email, reactivation_requested FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    if (!user.reactivation_requested) {
      return res.status(400).json({ error: 'No reactivation request found for this user' });
    }
    
    // Clear reactivation request (user remains disabled)
    await pool.execute(
      'UPDATE users SET reactivation_requested = 0 WHERE id = ?',
      [id]
    );
    
    // Create notification for user
    await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
      [id, 'system', 'Reactivation Request Rejected', 'Your account reactivation request has been rejected by an administrator. Please contact support for more information.', 'high']
    );
    
    res.json({ 
      message: 'Reactivation request rejected successfully',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Reject reactivation request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 