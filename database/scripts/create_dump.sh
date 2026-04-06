#!/bin/bash
# Usage: ./create_dump.sh
# Reads DB_USER, DB_NAME, DB_HOST, DB_PORT, DB_PASSWORD from environment variables.

DB_USER=postgres
DB_NAME=queue_smart_db
DB_HOST=localhost
DB_PORT=5432

export PGPASSWORD=admin123

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > db_backup.sql
