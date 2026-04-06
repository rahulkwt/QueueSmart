CREATE TABLE IF NOT EXISTS history (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    service_id INTEGER NOT NULL REFERENCES services(service_id),
    history_message VARCHAR(255) NOT NULL,
    history_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    history_status TEXT NOT NULL CHECK (history_status IN ('n/a'))
);
