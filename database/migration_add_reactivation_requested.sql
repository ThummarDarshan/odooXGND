-- Migration: Add reactivation_requested column to users table
-- Run this script to update existing databases

USE nexaui_db;

-- Add reactivation_requested column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS reactivation_requested TINYINT(1) DEFAULT 0;

-- Update existing users to have no reactivation requests by default
UPDATE users SET reactivation_requested = 0 WHERE reactivation_requested IS NULL;

-- Make sure the column has a default value for future inserts
ALTER TABLE users MODIFY COLUMN reactivation_requested TINYINT(1) DEFAULT 0;

-- Verify the column was added
DESCRIBE users; 