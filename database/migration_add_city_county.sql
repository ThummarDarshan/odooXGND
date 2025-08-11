-- Migration to add city and county fields to user_profiles table
-- and remove location field

-- Add new columns for city and county
ALTER TABLE user_profiles 
ADD COLUMN city VARCHAR(100) DEFAULT NULL,
ADD COLUMN county VARCHAR(100) DEFAULT NULL;

-- Migrate existing location data to city (assuming location was primarily city)
-- This is a best-effort migration - adjust as needed for your data
UPDATE user_profiles 
SET city = location
WHERE location IS NOT NULL;

-- Remove the old location column
ALTER TABLE user_profiles 
DROP COLUMN location;

-- Update the schema.sql to reflect these changes
-- The updated schema should have city and county instead of location
