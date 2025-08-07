const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { convertNamesToTitleCase } = require('../utils/stringUtils');

const router = express.Router();

// Validation rules
const updateUserValidation = [
  body('first_name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
  body('last_name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
];

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get users with pagination
    const [users] = await pool.execute(
      'SELECT id, first_name, last_name, email, role, is_verified, avatar, created_at FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );

    // Get total count
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Users can only access their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    const [users] = await pool.execute(
      'SELECT id, first_name, last_name, email, role, is_verified, avatar, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      user: users[0]
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', authenticateToken, updateUserValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const userId = req.params.id;
    const { first_name, last_name, email, avatar } = req.body;

    // Convert first name and last name to title case if provided
    let titleCaseFirstName = first_name;
    let titleCaseLastName = last_name;
    
    if (first_name || last_name) {
      const convertedNames = convertNamesToTitleCase(first_name || '', last_name || '');
      titleCaseFirstName = convertedNames.titleCaseFirstName;
      titleCaseLastName = convertedNames.titleCaseLastName;
    }

    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Check if email is already taken (if email is being updated)
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({ 
          error: 'Email is already taken' 
        });
      }
    }

    // Build update query dynamically
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

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (avatar) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'No fields to update' 
      });
    }

    updateValues.push(userId);

    // Update user
    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const [updatedUsers] = await pool.execute(
      'SELECT id, first_name, last_name, email, role, is_verified, avatar, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    // Create profile update notification
    try {
      await pool.execute(
        'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
        [userId, 'system', 'Profile Updated', `Your profile information has been updated successfully.`, 'low']
      );
    } catch (notificationError) {
      console.error('Failed to create profile update notification:', notificationError);
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUsers[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   DELETE /api/users/me
// @desc    Delete current user's account
// @access  Private
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Delete user (cascade will handle related records)
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    // Note: We don't create a notification here since the user account is being deleted
    // But we could log this action for admin purposes

    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({ 
        error: 'Cannot delete your own account' 
      });
    }

    // Delete user (cascade will handle related records)
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   PUT /api/users/:id/verify
// @desc    Verify user account (admin only)
// @access  Private/Admin
router.put('/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Update verification status
    await pool.execute(
      'UPDATE users SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'User verified successfully'
    });

  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/users/by-email
 * @desc Get user info by email
 * @access Public
 */
router.get('/by-email', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required' });
    }

    const [users] = await pool.execute(
      'SELECT id, first_name, last_name, email, role, is_verified, avatar, created_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user by email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
