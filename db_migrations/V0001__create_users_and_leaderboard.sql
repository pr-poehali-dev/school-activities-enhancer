CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level INTEGER DEFAULT 1,
    points INTEGER DEFAULT 0,
    progress DECIMAL(5,2) DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subject_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    subject VARCHAR(50) NOT NULL,
    progress DECIMAL(5,2) DEFAULT 0,
    UNIQUE(user_id, subject)
);

CREATE INDEX idx_users_points ON users(points DESC);
CREATE INDEX idx_users_updated ON users(updated_at DESC);