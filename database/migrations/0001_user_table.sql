CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    user_email VARCHAR(50) UNIQUE NOT NULL,
    user_username VARCHAR(50) UNIQUE NOT NULL,
    user_password VARCHAR(200) NOT NULL,
    user_full_name VARCHAR(50) NOT NULL,
    registration_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    user_role TEXT NOT NULL CHECK (user_role IN ('admin', 'user')) DEFAULT 'user',
    user_token VARCHAR(255)
);
