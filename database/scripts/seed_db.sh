#!/bin/bash

# THIS PATH MAY BE DIFFERENT
export PATH="$PATH:/c/Program Files/PostgreSQL/18/bin"

# Database connection parameters
DB_NAME=queue_smart_db
DB_USER=postgres
DB_PASSWORD=adminrahul
DB_HOST=localhost
DB_PORT=5432

SEED_FILE="$(dirname "$0")/../seeds/seed.sql"

export PGPASSWORD="$DB_PASSWORD"

# Wait for PostgreSQL to be ready before running
wait_for_db() {
    echo "Waiting for database to be ready..."
    for i in $(seq 1 30); do
        if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" 2>/dev/null; then
            echo "Database is ready!"
            return 0
        fi
        echo "Waiting for database... attempt $i/30"
        sleep 2
    done
    echo "Database connection timeout"
    exit 1
}

# Execute the seed file against the database
run_seed() {
    if [ ! -f "$SEED_FILE" ]; then
        echo "Seed file not found: $SEED_FILE"
        exit 1
    fi

    echo "Running seed file: $SEED_FILE"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SEED_FILE"
    local status=$?
    if [ $status -ne 0 ]; then
        echo "Error running seed file (status: $status)"
        exit 1
    fi
    echo "Seed data inserted successfully!"
}

wait_for_db
run_seed
