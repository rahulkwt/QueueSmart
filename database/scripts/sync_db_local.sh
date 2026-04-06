#!/bin/bash

# THIS PATH MAY BE DIFFERENT
export PATH="$PATH:/c/Program Files/PostgreSQL/18/bin"

# Database connection — read from .env or shell environment
DB_NAME=queue_smart_db
DB_USER=postgres
DB_PASSWORD=admin123
DB_HOST=localhost
DB_PORT=5432

MIGRATIONS_DIR="$(dirname "$0")/../migrations"
COMBINED_SQL_FILE="$(dirname "$0")/combined_migrations.sql"

export PGPASSWORD="$DB_PASSWORD"

# Function to wait for database to be ready
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

wait_for_db

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

echo "Looking for migration files in $MIGRATIONS_DIR"
migration_files=($(find "$MIGRATIONS_DIR" -name '[0-9][0-9][0-9][0-9]_*.sql' | sort))

if [ ${#migration_files[@]} -eq 0 ]; then
    echo "No migration files found in $MIGRATIONS_DIR"
    exit 0
fi

echo "Found ${#migration_files[@]} migration files"

# Clear the combined file if it exists
> "$COMBINED_SQL_FILE"

echo "Concatenating migration files into $COMBINED_SQL_FILE..."
for file in "${migration_files[@]}"; do
    echo "Processing $file..."
    grep -v '^[[:space:]]*--' "$file" | grep -v '^[[:space:]]*$' >> "$COMBINED_SQL_FILE"
    echo "" >> "$COMBINED_SQL_FILE"
done

echo "Executing combined migrations..."
execute_sql_file "$COMBINED_SQL_FILE"

echo "All migrations completed successfully!"
