-- GlobeTrotter Database Schema for XAMPP/MariaDB (no MySQL 8+ features)
-- Compatible with MariaDB 10.x (XAMPP default)

-- Create database
CREATE DATABASE IF NOT EXISTS globetrotter_db;
USE globetrotter_db;

-- Users table
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  role ENUM('user', 'admin') DEFAULT 'user',
  is_verified TINYINT(1) DEFAULT 0,
  is_enabled TINYINT(1) DEFAULT 1,
  reactivation_requested TINYINT(1) DEFAULT 0,
  otp VARCHAR(10),
  otp_expiry DATETIME,
  otp_attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User profiles table
DROP TABLE IF EXISTS user_profiles;
CREATE TABLE IF NOT EXISTS user_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  phone VARCHAR(30),
  location VARCHAR(255),
  website VARCHAR(500),
  social_links TEXT,
  preferences TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('message', 'like', 'follow', 'system', 'promotion') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table for JWT blacklisting
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Clean tables before inserting sample data
SET FOREIGN_KEY_CHECKS=0;
DELETE FROM user_profiles;
DELETE FROM notifications;
DELETE FROM users;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE user_profiles AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS=1;

-- Insert sample users
INSERT INTO users (first_name, last_name, email, password, role, is_verified, is_enabled) VALUES
('Admin', 'User', 'admin@globetrotter.com', '$2a$12$X.Xi/tB/Sd9QqLldM/Tk/.h1ZnlZ/2rRC/ejaMBTDFaoWTO5U5K.2', 'admin', 1, 1),
('John', 'Doe', 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 'user', 1, 1),
('Jane', 'Smith', 'jane@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 'user', 1, 1),
('Bob', 'Johnson', 'bob@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 'user', 0, 1),
('Disabled', 'User', 'disabled@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 'user', 1, 0);

-- Insert sample user profiles
INSERT INTO user_profiles (user_id, phone, location, website, social_links) VALUES
  (1, NULL, 'San Francisco, CA', 'https://admin.globetrotter.com', '{"twitter": "admin_globetrotter", "linkedin": "admin-globetrotter", "github": "admin-globetrotter"}'),
  (2, NULL, 'New York, NY', 'https://johndoe.dev', '{"twitter": "johndoe", "linkedin": "john-doe", "github": "johndoe"}'),
  (3, NULL, 'Los Angeles, CA', 'https://janesmith.design', '{"twitter": "janesmith", "linkedin": "jane-smith", "dribbble": "janesmith"}'),
  (4, NULL, 'Chicago, IL', 'https://bobjohnson.dev', '{"twitter": "bobjohnson", "linkedin": "bob-johnson", "github": "bobjohnson"}'),
  (5, NULL, 'Disabled City, DC', 'https://disabled.dev', '{"twitter": "disabled", "linkedin": "disabled-user", "github": "disabled"}');

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, priority) VALUES
(2, 'message', 'Sarah Johnson sent you a message', 'Hey! I wanted to discuss the new project requirements with you. Could we schedule a meeting for tomorrow?', 'high'),
(2, 'like', 'Your post is trending!', 'Alex Chen, Maria Rodriguez and 47 others loved your recent post about modern web development best practices.', 'high'),
(3, 'follow', 'Emma Wilson started following you', 'Emma Wilson started following you. She is a Senior UX Designer at TechCorp with 8 years of experience.', 'medium'),
(3, 'system', 'Security update completed', 'Your account security settings have been updated successfully. Two-factor authentication is now enabled.', 'high'),
(4, 'promotion', 'Limited time offer - 50% off Pro Plan', 'Upgrade to GlobeTrotter Pro today and get 50% off for the first 3 months! This exclusive offer expires in 24 hours.', 'high'),
(2, 'message', 'Team mention in #design-team', 'You were mentioned by John Doe in the design team channel: @user great work on the new dashboard mockup!', 'medium'),
(3, 'like', 'Comment appreciation', 'Maria Rodriguez and 8 others liked your thoughtful comment on the UI/UX discussion thread.', 'low'),
(4, 'system', 'Weekly activity report is ready', 'Your weekly activity report is now available for review. You have completed 15 tasks this week.', 'medium');