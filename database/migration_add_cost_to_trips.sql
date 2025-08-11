-- Migration: Add cost column to trips table
-- Run this script to update existing databases

USE globetrotter_db;

ALTER TABLE trips ADD COLUMN IF NOT EXISTS cost DECIMAL(12,2) DEFAULT 0.00;

-- Verify the column was added
DESCRIBE trips;
