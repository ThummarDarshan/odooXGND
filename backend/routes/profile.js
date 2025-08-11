const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Validation rules
const updateProfileValidation = [
  body('phone').optional().trim().isLength({ max: 30 }).withMessage('Phone must be less than 30 characters'),
  body('city').optional().trim().isLength({ max: 100 }).withMessage('City must be less than 100 characters'),
  body('country').optional().trim().isLength({ max: 100 }).withMessage('Country must be less than 100 characters'),
  body('website').optional().isURL().withMessage('Website must be a valid URL'),
  body('social_links').optional().isObject().withMessage('Social links must be an object')
];


// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user profile with user info
    const [profiles] = await pool.execute(`
      SELECT 
        up.id,
        up.user_id,
        up.phone,
        up.city,
        up.country,
        up.website,
        up.social_links,
        up.preferences,
        up.created_at,
        up.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar,
        u.role,
        u.is_verified
      FROM user_profiles up
      RIGHT JOIN users u ON up.user_id = u.id
      WHERE u.id = ?
    `, [userId]);

    if (profiles.length === 0) {
      return res.status(404).json({
        error: 'Profile not found'
      });
    }

    const profile = profiles[0];

    // If no profile exists, create one
    if (!profile.id) {
      const [result] = await pool.execute(
        'INSERT INTO user_profiles (user_id) VALUES (?)',
        [userId]
      );

      // Get the created profile
      const [newProfiles] = await pool.execute(`
        SELECT 
          up.id,
          up.user_id,
          up.phone,
          up.city,
        up.country,
          up.website,
          up.social_links,
          up.preferences,
          up.created_at,
          up.updated_at,
          u.first_name,
          u.last_name,
          u.email,
          u.avatar,
          u.role,
          u.is_verified
        FROM user_profiles up
        RIGHT JOIN users u ON up.user_id = u.id
        WHERE u.id = ?
      `, [userId]);

      return res.json({
        profile: newProfiles[0]
      });
    }

    res.json({
      profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', authenticateToken, updateProfileValidation, async (req, res) => {
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
    const { phone, city, country, website, social_links, preferences } = req.body;

    // Check if profile exists
    const [existingProfiles] = await pool.execute(
      'SELECT id FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (existingProfiles.length === 0) {
      // Create new profile
      const [result] = await pool.execute(
  'INSERT INTO user_profiles (user_id, phone, city, country, website, social_links, preferences) VALUES (?, ?, ?, ?, ?, ?, ?)',
  [userId, phone || null, city || null, country || null, website || null,
   social_links ? JSON.stringify(social_links) : null,
   preferences ? JSON.stringify(preferences) : null]
);
    } else {
      // Update existing profile
      const updateFields = [];
      const updateValues = [];

      if (phone !== undefined) {
        updateFields.push('phone = ?');
        updateValues.push(phone);
      }

      if (city !== undefined) {
  updateFields.push('city = ?');
  updateValues.push(city);
}
if (country !== undefined) {
  updateFields.push('country = ?');
  updateValues.push(country);
}
      if (website !== undefined) {
        updateFields.push('website = ?');
        updateValues.push(website);
      }

      if (social_links !== undefined) {
        updateFields.push('social_links = ?');
        updateValues.push(JSON.stringify(social_links));
      }

      if (preferences !== undefined) {
        updateFields.push('preferences = ?');
        updateValues.push(JSON.stringify(preferences));
      }

      if (updateFields.length > 0) {
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(userId);

        await pool.execute(
          `UPDATE user_profiles SET ${updateFields.join(', ')} WHERE user_id = ?`,
          updateValues
        );
      }
    }

    // Get updated profile
    const [profiles] = await pool.execute(`
      SELECT 
        up.id,
        up.user_id,
        up.phone,
        up.city,
        up.country,
        up.website,
        up.social_links,
        up.preferences,
        up.created_at,
        up.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar,
        u.role,
        u.is_verified
      FROM user_profiles up
      RIGHT JOIN users u ON up.user_id = u.id
      WHERE u.id = ?
    `, [userId]);

    // Add activity notification for profile update
    await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
      [userId, 'system', 'Profile Updated', 'Your profile information was updated.', 'medium']
    );

    res.json({
      message: 'Profile updated successfully',
      profile: profiles[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// @route   GET /api/profile/:userId
// @desc    Get public profile by user ID
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get public profile info
    const [profiles] = await pool.execute(`
      SELECT 
        up.bio,
        up.city,
        up.country,
        up.website,
        up.social_links,
        up.created_at,
        u.full_name,
        u.avatar,
        u.created_at as user_created_at
      FROM user_profiles up
      RIGHT JOIN users u ON up.user_id = u.id
      WHERE u.id = ?
    `, [userId]);

    if (profiles.length === 0) {
      return res.status(404).json({
        error: 'Profile not found'
      });
    }

    res.json({
      profile: profiles[0]
    });

  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// @route   PUT /api/profile/disable
// @desc    Disable user account (soft delete)
// @access  Private
router.put('/disable', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Set is_enabled = 0 for the user
    await pool.execute(
      'UPDATE users SET is_enabled = 0 WHERE id = ?',
      [userId]
    );
    // Add notification for user
    await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
      [userId, 'system', 'Account Disabled', 'Your account has been disabled. Contact support to reactivate.', 'high']
    );
    res.json({
      message: 'Account disabled successfully.'
    });
  } catch (error) {
    console.error('Disable account error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// @route   POST /api/profile/avatar
// @desc    Upload profile picture
// @access  Private
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const userId = req.user.id;
    // Save file path as avatar URL (relative to /uploads/avatars)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await pool.execute('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, userId]);
    res.json({ message: 'Profile picture uploaded successfully', avatar: avatarUrl });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 