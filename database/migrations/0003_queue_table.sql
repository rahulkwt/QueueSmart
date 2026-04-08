CREATE TABLE IF NOT EXISTS queue (
    queue_id SERIAL PRIMARY KEY,
    queue_name VARCHAR(50) UNIQUE NOT NULL,
    service_id INTEGER NOT NULL REFERENCES services(service_id),
    service_creation_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    estimated_time INTEGER NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);
