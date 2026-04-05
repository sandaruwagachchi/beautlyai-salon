-- PostgreSQL initialization script for local development
-- Creates the beautlyai_admin user and beautlyai_dev database

-- Create the beautlyai_admin role with login and password
CREATE ROLE beautlyai_admin WITH LOGIN PASSWORD 'dev_password_123' CREATEDB;

-- Grant necessary privileges
GRANT CREATE ON DATABASE postgres TO beautlyai_admin;

-- Create the database owned by beautlyai_admin
CREATE DATABASE beautlyai_dev OWNER beautlyai_admin;

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE beautlyai_dev TO beautlyai_admin;

-- Connect to the new database and set privileges on schema
\connect beautlyai_dev

-- Grant privileges on public schema
GRANT ALL PRIVILEGES ON SCHEMA public TO beautlyai_admin;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO beautlyai_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO beautlyai_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO beautlyai_admin;

