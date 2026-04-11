-- Create beautlyai_admin user for the application
-- Use default password hashing (SCRAM-SHA-256 for PostgreSQL 15)
DROP ROLE IF EXISTS beautlyai_admin;
CREATE ROLE beautlyai_admin WITH LOGIN PASSWORD 'dev_password_123';

-- Grant privileges on the beautlyai_dev database
GRANT CONNECT ON DATABASE beautlyai_dev TO beautlyai_admin;
GRANT CREATE ON DATABASE beautlyai_dev TO beautlyai_admin;
GRANT USAGE ON SCHEMA public TO beautlyai_admin;
GRANT CREATE ON SCHEMA public TO beautlyai_admin;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO beautlyai_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO beautlyai_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO beautlyai_admin;

-- Ensure remote TCP connections work with password auth
-- This should be configured in pg_hba.conf, but we're setting up the user correctly here



