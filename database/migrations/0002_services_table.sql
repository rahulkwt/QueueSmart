CREATE TABLE IF NOT EXISTS services (
    service_id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) UNIQUE NOT NULL,
    service_description VARCHAR(255) NOT NULL,
    service_duration INTEGER NOT NULL,
    service_is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);
