
DROP TABLE IF EXISTS problems;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

-- Future table for users --
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NULL,
    gym VARCHAR(100) NOT NULL,
    climb_date DATE NOT NULL,
    current_status VARCHAR(50) DEFAULT 'Active' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bouldering problems --
CREATE TABLE IF NOT EXISTS problems (
    id SERIAL PRIMARY KEY,
    session_id INT NULL,
    style VARCHAR(50) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    tries INT DEFAULT 1 NOT NULL,
    current_status VARCHAR(50) DEFAULT 'Send' NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL

);

-- Test data -- 
INSERT INTO users (username, email, password_hash)
VALUES ('testuser' ,'test@example.com', 'hashed_secret_123');

INSERT INTO sessions (user_id, gym, climb_date, current_status)
VALUES (
    1,
    'Klättercentret',
    CURRENT_DATE,
    'Active'
);

INSERT INTO problems (session_id, style, grade, tries, current_status, notes)
VALUES (
    1,
    'Slab',
    '6B',
    3,
    'Send',
    'Tricky start, but with an easy finish.'
);

