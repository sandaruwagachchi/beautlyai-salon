-- PostgreSQL initialization script for BeautlyAI Salon API local development
-- This script runs automatically when PostgreSQL container starts for the first time

-- The official postgres image already creates POSTGRES_USER and POSTGRES_DB.
-- Keep this script idempotent so container restarts or volume resets don't fail.

-- Ensure the application database exists before we connect to it
SELECT format('CREATE DATABASE %I OWNER %I', 'beautylai_dev', 'beautlyai_admin')
WHERE NOT EXISTS (
	SELECT 1 FROM pg_database WHERE datname = 'beautylai_dev'
)\gexec

-- Connect to beautlyai_dev and set up schema privileges
\connect beautlyai_dev

-- Grant privileges on public schema
GRANT ALL PRIVILEGES ON SCHEMA public TO beautlyai_admin;
GRANT USAGE ON SCHEMA public TO beautlyai_admin;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO beautlyai_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO beautlyai_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO beautlyai_admin;

-- Display confirmation
SELECT 'PostgreSQL initialization complete!' AS status;
SELECT usename FROM pg_user WHERE usename = 'beautlyai_admin';
SELECT datname FROM pg_database WHERE datname = 'beautlyai_dev';





