-- Admin Dashboard Performance Optimization
-- Add indexes and optimize RPC functions for better performance

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_teams_status_district ON teams(registration_status, school_district);
CREATE INDEX IF NOT EXISTS idx_teams_created_status ON teams(created_at DESC, registration_status);
CREATE INDEX IF NOT EXISTS idx_teams_teacher_verified ON teams(teacher_verified, registration_status);
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_team_lead ON team_members(team_id, is_team_lead);

-- Optimize the admin dashboard stats function
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
  WITH team_stats AS (
    SELECT 
      COUNT(*) as total_registrations,
      COUNT(*) FILTER (WHERE registration_status = 'pending') as pending_registrations,
      COUNT(*) FILTER (WHERE registration_status = 'shortlisted') as shortlisted_registrations,
      COUNT(*) FILTER (WHERE registration_status = 'rejected') as rejected_registrations,
      COUNT(*) FILTER (WHERE registration_status = 'verified') as verified_registrations,
      COUNT(*) FILTER (WHERE teacher_verified = true) as teacher_verified_count
    FROM teams
  ),
  payment_stats AS (
    SELECT 
      COALESCE(SUM(amount) FILTER (WHERE payment_status = 'completed'), 0) as total_revenue
    FROM payments
  )
  SELECT 
    ts.total_registrations,
    ts.pending_registrations,
    ts.shortlisted_registrations,
    ts.rejected_registrations,
    ts.verified_registrations,
    ts.teacher_verified_count,
    ps.total_revenue
  FROM team_stats ts, payment_stats ps;
END;
$$;

-- Optimize the teams with member count function
DROP FUNCTION IF EXISTS get_teams_with_member_count();

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
  member_count bigint,
  teacher_verified boolean
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
    COALESCE(p.payment_status, 'pending') as payment_status,
    t.created_at,
    COUNT(tm.id) as member_count,
    t.teacher_verified
  FROM teams t
  LEFT JOIN team_members tm ON t.id = tm.team_id
  LEFT JOIN payments p ON t.id = p.team_id
  GROUP BY t.id, t.team_name, t.school_name, t.school_district, 
           t.lead_email, t.lead_phone, t.registration_status, 
           p.payment_status, t.created_at, t.teacher_verified
  ORDER BY t.created_at DESC;
END;
$$;

-- Create a new optimized function for payment insights
CREATE OR REPLACE FUNCTION get_payment_insights()
RETURNS TABLE (
  total_revenue bigint,
  completed_payments bigint,
  pending_payments bigint,
  failed_payments bigint,
  conversion_rate numeric,
  average_payment_time numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH payment_stats AS (
    SELECT 
      COUNT(*) as total_payments,
      COUNT(*) FILTER (WHERE payment_status = 'completed') as completed_payments,
      COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_payments,
      COUNT(*) FILTER (WHERE payment_status = 'failed') as failed_payments,
      COALESCE(SUM(amount) FILTER (WHERE payment_status = 'completed'), 0) as total_revenue,
      AVG(
        CASE 
          WHEN payment_status = 'completed' 
          THEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 60.0
          ELSE NULL 
        END
      ) as avg_time_minutes
    FROM payments
  )
  SELECT 
    ps.total_revenue,
    ps.completed_payments,
    ps.pending_payments,
    ps.failed_payments,
    CASE 
      WHEN ps.total_payments > 0 
      THEN (ps.completed_payments::numeric / ps.total_payments::numeric) * 100
      ELSE 0 
    END as conversion_rate,
    COALESCE(ps.avg_time_minutes, 0) as average_payment_time
  FROM payment_stats ps;
END;
$$;

-- Create a function to get paginated team registrations
CREATE OR REPLACE FUNCTION get_paginated_teams(
  page_offset integer DEFAULT 0,
  page_limit integer DEFAULT 50,
  status_filter text DEFAULT NULL,
  district_filter text DEFAULT NULL,
  search_term text DEFAULT NULL
)
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
  member_count bigint,
  teacher_verified boolean,
  total_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_teams bigint;
BEGIN
  -- Get total count for pagination
  SELECT COUNT(*) INTO total_teams
  FROM teams t
  WHERE 
    (status_filter IS NULL OR t.registration_status = status_filter)
    AND (district_filter IS NULL OR t.school_district = district_filter)
    AND (search_term IS NULL OR 
         t.team_name ILIKE '%' || search_term || '%' OR
         t.school_name ILIKE '%' || search_term || '%' OR
         t.lead_email ILIKE '%' || search_term || '%');

  RETURN QUERY
  SELECT 
    t.id,
    t.team_name,
    t.school_name,
    t.school_district,
    t.lead_email,
    t.lead_phone,
    t.registration_status,
    COALESCE(p.payment_status, 'pending') as payment_status,
    t.created_at,
    COUNT(tm.id) as member_count,
    t.teacher_verified,
    total_teams
  FROM teams t
  LEFT JOIN team_members tm ON t.id = tm.team_id
  LEFT JOIN payments p ON t.id = p.team_id
  WHERE 
    (status_filter IS NULL OR t.registration_status = status_filter)
    AND (district_filter IS NULL OR t.school_district = district_filter)
    AND (search_term IS NULL OR 
         t.team_name ILIKE '%' || search_term || '%' OR
         t.school_name ILIKE '%' || search_term || '%' OR
         t.lead_email ILIKE '%' || search_term || '%')
  GROUP BY t.id, t.team_name, t.school_name, t.school_district, 
           t.lead_email, t.lead_phone, t.registration_status, 
           p.payment_status, t.created_at, t.teacher_verified
  ORDER BY t.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_teams_with_member_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_insights() TO authenticated;
GRANT EXECUTE ON FUNCTION get_paginated_teams(integer, integer, text, text, text) TO authenticated;
