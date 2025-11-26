-- Clear all data from tables except admin table
-- This migration removes all registration data while preserving admin accounts

-- Disable triggers temporarily to avoid issues with foreign key constraints
SET session_replication_role = replica;

-- Clear all data from tables (in order to respect foreign key constraints)
-- Note: TRUNCATE doesn't support multiple tables with CASCADE in one statement
-- We need to truncate them one by one in reverse dependency order

TRUNCATE TABLE teacher_verifications RESTART IDENTITY CASCADE;
TRUNCATE TABLE project_details RESTART IDENTITY CASCADE;
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE team_status_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE team_members RESTART IDENTITY CASCADE;
TRUNCATE TABLE teams RESTART IDENTITY CASCADE;

-- Clear configuration table (optional - you may want to keep some config)
-- TRUNCATE TABLE configuration RESTART IDENTITY;

-- Clear districts table (optional - you may want to keep district data)
-- TRUNCATE TABLE districts RESTART IDENTITY;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Reset sequences to start from 1
-- Note: This is handled by RESTART IDENTITY above

-- Log the cleanup
INSERT INTO team_status_logs (team_id, status, notes, created_at)
SELECT 
    '00000000-0000-0000-0000-000000000000'::uuid,
    'pending'::registration_status_type,
    'Database cleared - all registration data removed except admin accounts',
    NOW()
WHERE EXISTS (SELECT 1 FROM admins LIMIT 1);

-- Optional: Reset team code generation counter if you have one
-- This would depend on your team code generation logic

-- Verify admin table is intact
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admins LIMIT 1) THEN
        RAISE WARNING 'No admin accounts found in the database';
    ELSE
        RAISE NOTICE 'Admin accounts preserved successfully';
    END IF;
END $$;
