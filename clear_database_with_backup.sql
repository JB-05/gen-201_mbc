-- Database Clear Script with Backup for GEN-201_MBC
-- This script creates a backup before clearing all registration data
-- Run this script in your Supabase SQL editor or via psql

-- ===========================================
-- STEP 1: CREATE BACKUP TABLES
-- ===========================================

-- Create backup tables with timestamp
DO $$
DECLARE
    backup_suffix TEXT := '_backup_' || to_char(NOW(), 'YYYY_MM_DD_HH24_MI_SS');
BEGIN
    -- Backup teams table
    EXECUTE format('CREATE TABLE teams%s AS SELECT * FROM teams', backup_suffix);
    
    -- Backup team_members table
    EXECUTE format('CREATE TABLE team_members%s AS SELECT * FROM team_members', backup_suffix);
    
    -- Backup payments table
    EXECUTE format('CREATE TABLE payments%s AS SELECT * FROM payments', backup_suffix);
    
    -- Backup project_details table
    EXECUTE format('CREATE TABLE project_details%s AS SELECT * FROM project_details', backup_suffix);
    
    -- Backup teacher_verifications table
    EXECUTE format('CREATE TABLE teacher_verifications%s AS SELECT * FROM teacher_verifications', backup_suffix);
    
    -- Backup team_status_logs table
    EXECUTE format('CREATE TABLE team_status_logs%s AS SELECT * FROM team_status_logs', backup_suffix);
    
    RAISE NOTICE 'Backup tables created with suffix: %', backup_suffix;
END $$;

-- ===========================================
-- STEP 2: SHOW CURRENT DATA
-- ===========================================

SELECT 'BEFORE CLEARING:' as status;
SELECT 'Teams count:' as table_name, COUNT(*) as count FROM teams
UNION ALL
SELECT 'Team members count:', COUNT(*) FROM team_members
UNION ALL
SELECT 'Payments count:', COUNT(*) FROM payments
UNION ALL
SELECT 'Project details count:', COUNT(*) FROM project_details
UNION ALL
SELECT 'Teacher verifications count:', COUNT(*) FROM teacher_verifications
UNION ALL
SELECT 'Team status logs count:', COUNT(*) FROM team_status_logs
UNION ALL
SELECT 'Admin accounts count:', COUNT(*) FROM admins;

-- ===========================================
-- STEP 3: CLEAR DATA
-- ===========================================

-- Disable triggers to avoid foreign key constraint issues
SET session_replication_role = replica;

-- Clear all registration data (in dependency order)
-- Note: TRUNCATE doesn't support multiple tables with CASCADE in one statement
-- We need to truncate them one by one in reverse dependency order

TRUNCATE TABLE teacher_verifications RESTART IDENTITY CASCADE;
TRUNCATE TABLE project_details RESTART IDENTITY CASCADE;
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE team_status_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE team_members RESTART IDENTITY CASCADE;
TRUNCATE TABLE teams RESTART IDENTITY CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- ===========================================
-- STEP 4: VERIFY RESULTS
-- ===========================================

SELECT 'AFTER CLEARING:' as status;
SELECT 'Admin accounts count:', COUNT(*) FROM admins;

-- Show that other tables are empty
SELECT 'Teams count:', COUNT(*) FROM teams
UNION ALL
SELECT 'Team members count:', COUNT(*) FROM team_members
UNION ALL
SELECT 'Payments count:', COUNT(*) FROM payments
UNION ALL
SELECT 'Project details count:', COUNT(*) FROM project_details
UNION ALL
SELECT 'Teacher verifications count:', COUNT(*) FROM teacher_verifications
UNION ALL
SELECT 'Team status logs count:', COUNT(*) FROM team_status_logs;

-- ===========================================
-- STEP 5: LIST BACKUP TABLES
-- ===========================================

SELECT 'Backup tables created:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%_backup_%'
ORDER BY table_name;

-- Success message
SELECT 'Database cleared successfully! Admin accounts preserved. Backup tables created.' as result;
