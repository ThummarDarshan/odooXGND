-- Migration: Add budget column to trips table
ALTER TABLE trips ADD COLUMN budget DECIMAL(12,2) DEFAULT NULL AFTER description;
