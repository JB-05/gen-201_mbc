-- Database Clear Script for GEN-201_MBC
-- This script clears all registration data while preserving admin accounts
-- Run this script in your Supabase SQL editor or via psql

-- ===========================================
-- WARNING: This will delete ALL registration data
-- Make sure you have backups if needed
-- ===========================================

-- Check current data before clearing
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

-- Verify admin table is still intact
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

-- Success message
SELECT 'Database cleared successfully! Admin accounts preserved.' as result;
