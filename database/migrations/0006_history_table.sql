CREATE TABLE IF NOT EXISTS history (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    service_id INTEGER REFERENCES services(service_id),
    history_service VARCHAR(100) NOT NULL,
    history_doctor VARCHAR(100) NOT NULL DEFAULT '',
    history_date VARCHAR(10) NOT NULL,
    history_notes VARCHAR(300) NOT NULL DEFAULT '',
    history_status TEXT NOT NULL CHECK (history_status IN ('Pending', 'Completed', 'Cancelled', 'Aborted')),
    history_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
