-- Admin Dashboard Performance Optimization
-- Create efficient RPC functions for admin dashboard

-- Drop existing function if it exists with different signature
DROP FUNCTION IF EXISTS get_admin_dashboard_stats();

-- Function to get dashboard statistics efficiently
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
  total_registrations bigint,
  pending_registrations bigint,
  shortlisted_registrations bigint,
  rejected_registrations bigint,
  verified_registrations bigint,
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
    COALESCE(SUM(p.amount) FILTER (WHERE p.payment_status = 'completed'), 0) as total_revenue
  FROM teams t
  LEFT JOIN payments p ON t.id = p.team_id;
END;
$$;

-- Drop existing function if it exists with different signature
DROP FUNCTION IF EXISTS get_teams_with_member_count();

-- Function to get team registrations with member count efficiently
CREATE OR REPLACE FUNCTION get_teams_with_member_count()
RETURNS TABLE (
  id uuid,
  team_name text,
  school_name text,
  school_district text,
  lead_email text,
  lead_phone text,
  registration_status text,
  payment_status text,
  created_at timestamptz,
  member_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.team_name,
    t.school_name,
    t.school_district,
    t.lead_email,
    t.lead_phone,
    t.registration_status,
    p.payment_status,
    t.created_at,
    COUNT(tm.id) as member_count
  FROM teams t
  LEFT JOIN team_members tm ON t.id = tm.team_id
  LEFT JOIN payments p ON t.id = p.team_id
  GROUP BY t.id, t.team_name, t.school_name, t.school_district, 
           t.lead_email, t.lead_phone, t.registration_status, 
           p.payment_status, t.created_at
  ORDER BY t.created_at DESC;
END;
$$;

-- Drop existing function if it exists with different signature
DROP FUNCTION IF EXISTS get_district_insights();

-- Function to get district insights efficiently
CREATE OR REPLACE FUNCTION get_district_insights()
RETURNS TABLE (
  district text,
  total_teams bigint,
  total_schools bigint,
  pending_teams bigint,
  shortlisted_teams bigint,
  rejected_teams bigint,
  verified_teams bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.school_district as district,
    COUNT(*) as total_teams,
    COUNT(DISTINCT t.school_name) as total_schools,
    COUNT(*) FILTER (WHERE t.registration_status = 'pending') as pending_teams,
    COUNT(*) FILTER (WHERE t.registration_status = 'shortlisted') as shortlisted_teams,
    COUNT(*) FILTER (WHERE t.registration_status = 'rejected') as rejected_teams,
    COUNT(*) FILTER (WHERE t.registration_status = 'verified') as verified_teams
  FROM teams t
  GROUP BY t.school_district
  ORDER BY total_teams DESC;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_registration_status ON teams(registration_status);
CREATE INDEX IF NOT EXISTS idx_teams_school_district ON teams(school_district);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_payments_team_id ON payments(team_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_teams_with_member_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_district_insights() TO authenticated;
