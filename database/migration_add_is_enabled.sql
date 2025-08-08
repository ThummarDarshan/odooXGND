-- Migration: Add is_enabled column to users table
-- Run this script to update existing databases

USE nexaui_db;

-- Add is_enabled column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_enabled TINYINT(1) DEFAULT 1;

-- Update existing users to be enabled by default
UPDATE users SET is_enabled = 1 WHERE is_enabled IS NULL;

-- Make sure the column has a default value for future inserts
ALTER TABLE users MODIFY COLUMN is_enabled TINYINT(1) DEFAULT 1;

-- Verify the column was added
DESCRIBE users; 