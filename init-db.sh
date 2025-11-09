#!/bin/bash
set -e

# This script runs automatically when the PostgreSQL container starts
# It creates the database and user if they don't exist

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Database is already created by POSTGRES_DB env variable
    -- This script can be used for additional setup if needed
    SELECT 'Database setup completed successfully!' as message;
EOSQL
