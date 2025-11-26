-- Add teacher verification status to teams table
-- This will track whether the teacher has verified the team registration

-- Add verified column to teams table
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS teacher_verified BOOLEAN DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN teams.teacher_verified IS 'Whether the teacher has verified this team registration';

-- Create index for better performance on verification queries
CREATE INDEX IF NOT EXISTS idx_teams_teacher_verified ON teams(teacher_verified);

-- Update the admin dashboard stats function to include teacher verification
DROP FUNCTION IF EXISTS get_admin_dashboard_stats();

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
  total_registrations bigint,
  pending_registrations bigint,
  shortlisted_registrations bigint,
  rejected_registrations bigint,
  verified_registrations bigint,
  teacher_verified_count bigint,
  total_revenue bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_registrations,
    COUNT(*) FILTER (WHERE registration_status = 'pending') as pending_registrations,
    COUNT(*) FILTER (WHERE registration_status = 'shortlisted') as shortlisted_registrations,
    COUNT(*) FILTER (WHERE registration_status = 'rejected') as rejected_registrations,
    COUNT(*) FILTER (WHERE registration_status = 'verified') as verified_registrations,
    COUNT(*) FILTER (WHERE teacher_verified = true) as teacher_verified_count,
    COALESCE(SUM(p.amount) FILTER (WHERE p.payment_status = 'completed'), 0) as total_revenue
  FROM teams t
  LEFT JOIN payments p ON t.id = p.team_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
