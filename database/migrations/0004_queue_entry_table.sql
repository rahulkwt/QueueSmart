CREATE TABLE IF NOT EXISTS queue_entry (
    entry_id SERIAL PRIMARY KEY,
    queue_id INTEGER NOT NULL REFERENCES queue(queue_id),
    service_id INTEGER NOT NULL REFERENCES services(service_id),
    queue_entry_status TEXT NOT NULL CHECK (queue_entry_status IN ('completed', 'pending', 'cancelled')),
    queue_entry_position INTEGER NOT NULL,
    queue_join_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    queue_priority TEXT NOT NULL CHECK (queue_priority IN ('low', 'mid', 'high'))
);
