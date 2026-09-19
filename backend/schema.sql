CREATE DATABASE IF NOT EXISTS problem_db;
USE problem_db;

DROP TABLE IF EXISTS problems;
DROP TABLE IF EXISTS users;

-- Future table for users --
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bouldering problems --
CREATE TABLE problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    style VARCHAR(50) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    tries INT DEFAULT 1 NOT NULL,
    current_status VARCHAR(50) DEFAULT 'Send' NOT NULL,
    gym VARCHAR(100) NOT NULL,
    climb_date DATE NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL

);

-- Test data -- 
INSERT INTO users (username, email, password_hash)
VALUES ('testuser' ,'test@example.com', 'hashed_secret_123');

INSERT INTO problems (user_id, style, grade, tries, current_status, gym, climb_date, notes)
VALUES (
    1,
    'Slab',
    '6B',
    3,
    'Send',
    'Klättercentret',
    CURRENT_DATE(),
    'Tricky start, but with an easy finish.'
);

