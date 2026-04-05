-- PostgreSQL initialization script for BeautlyAI Salon API local development
-- This script runs automatically when PostgreSQL container starts for the first time

-- Create the custom role/user
CREATE ROLE beautlyai_admin WITH LOGIN PASSWORD 'dev_password_123' SUPERUSER CREATEDB;

-- Create the application database owned by beautlyai_admin
CREATE DATABASE beautlyai_dev WITH OWNER beautlyai_admin;

-- Grant privileges on database
GRANT ALL PRIVILEGES ON DATABASE beautlyai_dev TO beautlyai_admin;

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





