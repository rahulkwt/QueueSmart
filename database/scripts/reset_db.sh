#!/bin/bash

# THIS PATH MAY BE DIFFERENT
export PATH="$PATH:/c/Program Files/PostgreSQL/18/bin"

# Database connection parameters — read from .env or shell environment
DB_NAME=queue_smart_db
DB_USER=postgres
DB_PASSWORD=admin123
DB_HOST=localhost
DB_PORT=5432

MIGRATIONS_DIR="$(dirname "$0")/../migrations"

export PGPASSWORD="$DB_PASSWORD"

# Function to wait for the database to be ready
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

# Function to execute a SQL file
execute_sql_file() {
    local file=$1
    echo "Executing $file..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file"
    local status=$?
    if [ $status -ne 0 ]; then
        echo "Error executing $file (status: $status)"
        exit 1
    fi
    echo "Successfully executed $file"
}

# Drop all tables in the public schema
drop_tables() {
    echo "Dropping all tables..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<'EOSQL'
DROP TABLE IF EXISTS history CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS queue_entry CASCADE;
DROP TABLE IF EXISTS queue CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS users CASCADE;
EOSQL
    echo "All tables dropped."
}

# Run all migration files in order
run_migrations() {
    if [ ! -d "$MIGRATIONS_DIR" ]; then
        echo "Migrations directory not found: $MIGRATIONS_DIR"
        exit 1
    fi

    migration_files=($(find "$MIGRATIONS_DIR" -name '[0-9][0-9][0-9][0-9]_*.sql' | sort))

    if [ ${#migration_files[@]} -eq 0 ]; then
        echo "No migration files found in $MIGRATIONS_DIR"
        exit 0
    fi

    echo "Found ${#migration_files[@]} migration files"
    for file in "${migration_files[@]}"; do
        execute_sql_file "$file"
    done
    echo "All migrations completed successfully!"
}

case "$1" in
    "drop")
        wait_for_db
        drop_tables
        ;;
    "migrate")
        wait_for_db
        run_migrations
        ;;
    "reset")
        wait_for_db
        drop_tables
        run_migrations
        ;;
    *)
        echo "Usage: $0 {drop|migrate|reset}"
        exit 1
        ;;
esac
