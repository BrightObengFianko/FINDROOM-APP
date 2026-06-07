
-- Create the FindRoom database
CREATE DATABASE IF NOT EXISTS findroom_db;

-- Switch to the new database
USE findroom_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    -- Account role
    role ENUM('user', 'landlord', 'admin') NOT NULL DEFAULT 'user',

    -- Optional extra roles
    roles_json JSON NULL,

    -- Landlord verification (one-time process)
    landlord_verification_status ENUM(
        'not_submitted',
        'pending',
        'approved',
        'rejected'
    ) NOT NULL DEFAULT 'not_submitted',

    landlord_verification_submitted_at DATETIME NULL,
    landlord_verification_reviewed_at DATETIME NULL,

    -- Store verification documents/details
    landlord_verification JSON NULL,

    -- Login tracking
    login_count INT NOT NULL DEFAULT 0,
    last_login_at DATETIME NULL,
    last_login_ip VARCHAR(100) NOT NULL DEFAULT '',
    last_login_verified TINYINT(1) NOT NULL DEFAULT 0,

    -- Account status
    status ENUM('active', 'blocked') NOT NULL DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Login attempts audit table
CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NULL,

    email VARCHAR(100) NOT NULL,
    user_name VARCHAR(100) NOT NULL DEFAULT '',

    role_requested ENUM('user', 'landlord', 'admin')
        NOT NULL DEFAULT 'user',

    role_resolved ENUM('user', 'landlord', 'admin')
        NOT NULL DEFAULT 'user',

    status ENUM('success', 'failed')
        NOT NULL,

    verified TINYINT(1)
        NOT NULL DEFAULT 0,

    failure_reason VARCHAR(100)
        NOT NULL DEFAULT '',

    ip_address VARCHAR(100)
        NOT NULL DEFAULT '',

    user_agent VARCHAR(255)
        NOT NULL DEFAULT '',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_login_attempts_email (email),
    INDEX idx_login_attempts_user_id (user_id),
    INDEX idx_login_attempts_created_at (created_at),

    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Verify tables
SHOW TABLES;
```
