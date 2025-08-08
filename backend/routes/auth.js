const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const { convertNamesToTitleCase } = require('../utils/stringUtils');
const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const router = express.Router();

// Validation rules
const signupValidation = [
  body('first_name').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
  body('last_name').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// --- Google OAuth 2.0 (Best Practice Implementation) ---
// Configure Google Strategy only if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      if (!email) return done(new Error('No email found in Google profile'));
      // Try to find user
      const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      let user = users[0];
      if (!user) {
        // Create new user with Google info
        const firstName = profile.name && profile.name.givenName ? profile.name.givenName : '';
        const lastName = profile.name && profile.name.familyName ? profile.name.familyName : '';
        const avatar = profile.photos && profile.photos[0] && profile.photos[0].value ? profile.photos[0].value : null;
        const dummyPassword = 'GOOGLE_OAUTH_' + Math.random().toString(36).substring(2, 15);
        const [result] = await pool.execute(
          'INSERT INTO users (first_name, last_name, email, password, is_verified, avatar) VALUES (?, ?, ?, ?, ?, ?)',
          [firstName, lastName, email, dummyPassword, 1, avatar]
        );
        const [newUsers] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
        user = newUsers[0];
      }
      return done(null, user);
    } catch (err) {
      console.error('Google OAuth DB error:', err);
      return done(err, null);
    }
  }));
  console.log('✅ Google OAuth strategy configured successfully');
} else {
  console.log('⚠️  Google OAuth credentials not found. Google OAuth will be disabled.');
}

// Initiate Google OAuth login
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  }));

  // Google OAuth callback
  router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Google OAuth callback error:', err, info);
        return res.redirect('http://localhost:3000/login?error=google_oauth_error');
      }
      if (!user) {
        console.error('No user returned from Google OAuth:', info);
        return res.redirect('http://localhost:3000/login?error=no_user');
      }
      try {
        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        // Redirect to frontend with token
        res.redirect(`http://localhost:3000/login?token=${token}`);
      } catch (jwtErr) {
        console.error('JWT sign error:', jwtErr);
        res.redirect('http://localhost:3000/login?error=jwt_error');
      }
    })(req, res, next);
  });
} else {
  // Fallback routes when Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(503).json({ 
      error: 'Google OAuth is not configured',
      message: 'Please set up GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
    });
  });

  router.get('/google/callback', (req, res) => {
    res.status(503).json({ 
      error: 'Google OAuth is not configured',
      message: 'Please set up GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
    });
  });
}

// --- GitHub OAuth 2.0 Implementation ---
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  const fetch = require('node-fetch');
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5001/api/auth/github/callback',
    scope: ['user:email'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let email = profile.emails && profile.emails[0] && profile.emails[0].value;
      // If email is not present, fetch from GitHub API
      if (!email) {
        const response = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `token ${accessToken}`,
            'User-Agent': 'NexaUI'
          }
        });
        const emails = await response.json();
        if (Array.isArray(emails)) {
          // Find primary and verified email
          const primaryEmail = emails.find(e => e.primary && e.verified);
          const anyVerified = emails.find(e => e.verified);
          email = (primaryEmail && primaryEmail.email) || (anyVerified && anyVerified.email);
        }
      }
      if (!email) return done(new Error('No email found in GitHub profile or via API'));
      // Try to find user
      const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      let user = users[0];
      if (!user) {
        // Create new user with GitHub info
        const firstName = profile.displayName || profile.username || '';
        const lastName = '';
        const avatar = profile.photos && profile.photos[0] && profile.photos[0].value ? profile.photos[0].value : null;
        const dummyPassword = 'GITHUB_OAUTH_' + Math.random().toString(36).substring(2, 15);
        const [result] = await pool.execute(
          'INSERT INTO users (first_name, last_name, email, password, is_verified, avatar) VALUES (?, ?, ?, ?, ?, ?)',
          [firstName, lastName, email, dummyPassword, 1, avatar]
        );
        const [newUsers] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
        user = newUsers[0];
      }
      return done(null, user);
    } catch (err) {
      console.error('GitHub OAuth DB error:', err);
      return done(err, null);
    }
  }));
  console.log('✅ GitHub OAuth strategy configured successfully');
} else {
  console.log('⚠️  GitHub OAuth credentials not found. GitHub OAuth will be disabled.');
}

// Initiate GitHub OAuth login
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

  // GitHub OAuth callback
  router.get('/github/callback', (req, res, next) => {
    passport.authenticate('github', { session: false }, (err, user, info) => {
      if (err) {
        console.error('GitHub OAuth callback error:', err, info);
        return res.redirect('http://localhost:3000/login?error=github_oauth_error');
      }
      if (!user) {
        console.error('No user returned from GitHub OAuth:', info);
        return res.redirect('http://localhost:3000/login?error=no_user');
      }
      try {
        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        // Redirect to frontend with token
        res.redirect(`http://localhost:3000/login?token=${token}`);
      } catch (jwtErr) {
        console.error('JWT sign error:', jwtErr);
        res.redirect('http://localhost:3000/login?error=jwt_error');
      }
    })(req, res, next);
  });
} else {
  // Fallback routes when GitHub OAuth is not configured
  router.get('/github', (req, res) => {
    res.status(503).json({ 
      error: 'GitHub OAuth is not configured',
      message: 'Please set up GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables'
    });
  });

  router.get('/github/callback', (req, res) => {
    res.status(503).json({ 
      error: 'GitHub OAuth is not configured',
      message: 'Please set up GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables'
    });
  });
}

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signupValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { first_name, last_name, email, password } = req.body;

    // Convert first name and last name to title case
    const { titleCaseFirstName, titleCaseLastName } = convertNamesToTitleCase(first_name, last_name);

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with title case names
    const [result] = await pool.execute(
      'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
      [titleCaseFirstName, titleCaseLastName, email, hashedPassword]
    );

    // Get the created user (without password)
    const [newUser] = await pool.execute(
      'SELECT id, first_name, last_name, email, role, is_verified, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser[0].id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Create welcome notification
    try {
      await pool.execute(
        'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
        [newUser[0].id, 'system', 'Welcome to NexaUI!', `Welcome ${newUser[0].first_name} ${newUser[0].last_name}! Your account has been created successfully.`, 'high']
      );
      // Add setup notification
      await pool.execute(
        'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
        [newUser[0].id, 'promotion', 'Complete Your Profile', `Welcome! Complete your profile to get the most out of NexaUI. Add your bio, location, and profile picture.`, 'medium']
      );
      // Add security notification
      await pool.execute(
        'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
        [newUser[0].id, 'system', 'Security Setup', `For better security, consider enabling two-factor authentication in your account settings.`, 'medium']
      );
      // Add activity notification for account creation
      await pool.execute(
        'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
        [newUser[0].id, 'system', 'Account Created', 'Your account was created.', 'medium']
      );
      // Send welcome email
      const welcomeSubject = 'Welcome to NexaUI!';
      const welcomeText = `Hello ${newUser[0].first_name},\n\nWelcome to NexaUI!\n\nThank you for joining our community. NexaUI is your all-in-one platform for modern UI development, collaboration, and productivity.\n\nHere’s what you can do next:\n- Explore your dashboard\n- Complete your profile for a personalized experience\n- Check out our latest features and resources\n\nIf you have any questions, our support team is here to help.\n\nGet started now: https://nexaui.com/login\n\nWe’re excited to have you with us!\n\nBest regards,\nThe NexaUI Team`;
      const welcomeHtml = `
        <div style=\"font-family: Arial, sans-serif; color: #222;\">
          <h2 style=\"color: #4F46E5;\">Welcome to NexaUI, ${newUser[0].first_name}!</h2>
          <p>Thank you for joining our community. <b>NexaUI</b> is your all-in-one platform for modern UI development, collaboration, and productivity.</p>
          <ul>
            <li>Explore your dashboard</li>
            <li>Complete your profile for a personalized experience</li>
            <li>Check out our latest features and resources</li>
          </ul>
          <p>If you have any questions, our support team is here to help.</p>
          <p style=\"margin: 32px 0;\">
            <a href=\"https://http://localhost:3000/login\" style=\"background: #4F46E5; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;\">Get Started</a>
          </p>
          <p>We’re excited to have you with us!<br/>Best regards,<br/><b>The NexaUI Team</b></p>
        </div>
      `;
      try {
        await sendEmail(newUser[0].email, welcomeSubject, welcomeText, welcomeHtml);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    } catch (notificationError) {
      console.error('Failed to create welcome notification:', notificationError);
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser[0],
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const [users] = await pool.execute(
      'SELECT id, first_name, last_name, email, password, role, is_verified, is_enabled, reactivation_requested FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    const user = users[0];

    // Check if user is enabled
    if (!user.is_enabled) {
      return res.status(403).json({ 
        error: 'Account is disabled. Please contact an administrator.',
        accountDisabled: true,
        reactivationRequested: user.reactivation_requested
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Create login notification
    try {
      // Fallback: use first+last name if present, else email
      const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.email;
      await pool.execute(
        'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
        [user.id, 'system', 'Login Successful', `Welcome back ${displayName}! You have successfully logged in.`, 'medium']
      );
      // Add activity notification for last login
      await pool.execute(
        'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
        [user.id, 'system', 'Last Login', `You logged in at ${new Date().toLocaleString()}.`, 'low']
      );
      // Add activity notification
      await pool.execute(
        'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
        [user.id, 'system', 'Account Activity', `Your account was accessed from a new session. If this wasn't you, please review your security settings.`, 'low']
      );
    } catch (notificationError) {
      console.error('Failed to create login notification:', notificationError);
    }

    // Remove password from response
    delete user.password;

    res.json({
      message: 'Login successful',
      user,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate token)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    // The client should remove the token from storage
    
    res.json({ 
      message: 'Logged out successfully' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, first_name, last_name, email, role, is_verified, is_enabled, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
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

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Generate new token
    const token = jwt.sign(
      { userId: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Token refreshed successfully',
      token
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new password are required.' });
    }
    // Get user from DB
    const [users] = await pool.execute(
      'SELECT id, password FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const user = users[0];
    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Old password is incorrect.' });
    }
    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    // Update password in DB
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );
    // Add activity notification for password change
    await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'system', 'Password Changed', 'Your password was changed successfully.', 'medium']
    );
    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/auth/forgot-password
 * @desc Generate OTP and send to user's email for password reset
 * @access Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const [users] = await pool.execute('SELECT id, first_name, otp_attempts FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User with this email does not exist' });
    }
    const user = users[0];

    // Limit OTP attempts to prevent abuse
    if (user.otp_attempts >= 5) {
      return res.status(429).json({ error: 'Too many OTP requests. Please try again later.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiry to 15 minutes from now
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Update user with OTP, expiry, and increment attempts
    await pool.execute(
      'UPDATE users SET otp = ?, otp_expiry = ?, otp_attempts = otp_attempts + 1 WHERE id = ?',
      [otp, otpExpiry, user.id]
    );

    // Send OTP email
    const subject = 'NexaUI Password Reset Request';
    const firstName = user.first_name ? user.first_name : '';
    const text = `Hello${firstName ? ' ' + firstName : ''},\n\nWe received a request to reset your NexaUI account password.\n\nYour One-Time Password (OTP) is: ${otp}\n\nThis OTP is valid for 15 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nThank you,\nThe NexaUI Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; background: #f9f9fc;">
        <h2 style="color: #3b82f6; margin-bottom: 12px;">NexaUI Password Reset</h2>
        <p>Hello${firstName ? ' <b>' + firstName + '</b>' : ''},</p>
        <p>We received a request to reset your <b>NexaUI</b> account password.</p>
        <p style="font-size: 1.1em; margin: 24px 0;">Your <b>One-Time Password (OTP)</b> is:</p>
        <div style="font-size: 2em; font-weight: bold; color: #2563eb; letter-spacing: 4px; margin-bottom: 16px;">${otp}</div>
        <p style="margin-bottom: 16px;">This OTP is valid for <b>15 minutes</b>.</p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e0e0e0;" />
        <p style="font-size: 0.95em; color: #888;">Thank you,<br/>The NexaUI Team</p>
      </div>
    `;

    await sendEmail(email, subject, text, html);

    res.json({ message: 'OTP sent to your email address' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/auth/reset-password
 * @desc Verify OTP and reset user password
 * @access Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    // Find user by email
    const [users] = await pool.execute('SELECT id, otp, otp_expiry FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User with this email does not exist' });
    }
    const user = users[0];

    // Check if OTP matches and is not expired
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (!user.otp_expiry || new Date(user.otp_expiry) < new Date()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear OTP fields
    await pool.execute(
      'UPDATE users SET password = ?, otp = NULL, otp_expiry = NULL, otp_attempts = 0 WHERE id = ?',
      [hashedPassword, user.id]
    );

    // Add notification for password reset
    await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
      [user.id, 'system', 'Password Reset', 'Your password was reset successfully.', 'medium']
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /api/auth/debug-otp
 * @desc Debug endpoint to get OTP and expiry for a user by email (for development only)
 * @access Public
 */
router.get('/debug-otp', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required' });
    }

    const [users] = await pool.execute(
      'SELECT otp, otp_expiry FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ otp: users[0].otp, otp_expiry: users[0].otp_expiry });
  } catch (error) {
    console.error('Debug OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/auth/verify-otp
 * @desc Verify OTP without changing password
 * @access Public
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find user by email
    const [users] = await pool.execute('SELECT otp, otp_expiry FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User with this email does not exist' });
    }
    const user = users[0];

    // Check if OTP matches and is not expired
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (!user.otp_expiry || new Date(user.otp_expiry) < new Date()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/auth/request-reactivation
// @desc    Request account reactivation for disabled users
// @access  Public
router.post('/request-reactivation', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email } = req.body;

    // Find user by email
    const [users] = await pool.execute(
      'SELECT id, first_name, last_name, email, is_enabled, reactivation_requested FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        error: 'User with this email does not exist' 
      });
    }

    const user = users[0];

    // Check if user is disabled
    if (user.is_enabled) {
      return res.status(400).json({ 
        error: 'Account is already enabled' 
      });
    }

    // Check if reactivation is already requested
    if (user.reactivation_requested) {
      return res.status(400).json({ 
        error: 'Reactivation request already submitted. Please wait for admin approval.' 
      });
    }

    // Set reactivation request flag
    await pool.execute(
      'UPDATE users SET reactivation_requested = 1 WHERE id = ?',
      [user.id]
    );

    // Create notification for admin
    try {
      await pool.execute(
        'INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)',
        [user.id, 'system', 'Account Reactivation Request', `${user.first_name} ${user.last_name} (${user.email}) has requested account reactivation.`, 'high']
      );
    } catch (notificationError) {
      console.error('Failed to create reactivation notification:', notificationError);
    }

    res.json({ 
      message: 'Reactivation request submitted successfully. An administrator will review your request.' 
    });

  } catch (error) {
    console.error('Request reactivation error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
