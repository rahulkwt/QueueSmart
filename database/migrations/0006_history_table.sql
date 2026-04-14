CREATE TABLE IF NOT EXISTS history (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    service_id INTEGER REFERENCES services(service_id),
    history_service_name VARCHAR(255) NOT NULL,
    history_notes VARCHAR(255),
    history_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    history_status TEXT NOT NULL CHECK (history_status IN ('pending', 'completed', 'cancelled'))
);
