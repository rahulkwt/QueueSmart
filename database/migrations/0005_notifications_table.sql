CREATE TABLE IF NOT EXISTS notifications (
    notif_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    notif_message VARCHAR(255) NOT NULL,
    notif_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notif_status TEXT NOT NULL CHECK (notif_status IN ('unread', 'read'))
);
