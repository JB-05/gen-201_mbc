-- Harden functions: set static search_path, schema-qualify objects, add admin guards where needed

-- 1) public.is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE auth_user_id = auth.uid()
    );
END;
$$;

-- 2) log_team_status_change (trigger)
CREATE OR REPLACE FUNCTION public.log_team_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    SELECT a.id INTO v_admin_id FROM public.admins a WHERE a.auth_user_id = auth.uid();

    IF NEW.registration_status <> OLD.registration_status THEN
        INSERT INTO public.team_status_logs (
            team_id,
            admin_id,
            old_status,
            new_status
        ) VALUES (
            NEW.id,
            v_admin_id,
            OLD.registration_status,
            NEW.registration_status
        );
    END IF;

    RETURN NEW;
END;
$$;

-- 3) sync_team_payment_status (trigger)
CREATE OR REPLACE FUNCTION public.sync_team_payment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.teams 
    SET payment_status = NEW.payment_status 
    WHERE id = NEW.team_id;
    RETURN NEW;
END;
$$;

-- 4) get_payment_analytics (RPC)
CREATE OR REPLACE FUNCTION public.get_payment_analytics()
RETURNS TABLE (
    total_revenue BIGINT,
    completed_payments BIGINT,
    pending_payments BIGINT,
    failed_payments BIGINT,
    conversion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN p.payment_status = 'completed' THEN p.amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN p.payment_status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN p.payment_status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN p.payment_status = 'failed' THEN 1 END) as failed_payments,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN p.payment_status = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2)
            ELSE 0 
        END as conversion_rate
    FROM public.payments p;
END;
$$;

-- 5) get_district_analytics (RPC)
CREATE OR REPLACE FUNCTION public.get_district_analytics()
RETURNS TABLE (
    district VARCHAR(100),
    total_teams BIGINT,
    unique_schools BIGINT,
    pending_teams BIGINT,
    shortlisted_teams BIGINT,
    rejected_teams BIGINT,
    verified_teams BIGINT,
    paid_teams BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.school_district as district,
        COUNT(*) as total_teams,
        COUNT(DISTINCT t.school_name) as unique_schools,
        COUNT(CASE WHEN t.registration_status = 'pending' THEN 1 END) as pending_teams,
        COUNT(CASE WHEN t.registration_status = 'shortlisted' THEN 1 END) as shortlisted_teams,
        COUNT(CASE WHEN t.registration_status = 'rejected' THEN 1 END) as rejected_teams,
        COUNT(CASE WHEN t.registration_status = 'verified' THEN 1 END) as verified_teams,
        COUNT(CASE WHEN t.payment_status = 'completed' THEN 1 END) as paid_teams
    FROM public.teams t
    GROUP BY t.school_district
    ORDER BY total_teams DESC;
END;
$$;

-- 6) get_admin_dashboard_stats (admin-only)
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
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
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH team_stats AS (
    SELECT 
      COUNT(*) as total_registrations,
      COUNT(*) FILTER (WHERE registration_status = 'pending') as pending_registrations,
      COUNT(*) FILTER (WHERE registration_status = 'shortlisted') as shortlisted_registrations,
      COUNT(*) FILTER (WHERE registration_status = 'rejected') as rejected_registrations,
      COUNT(*) FILTER (WHERE registration_status = 'verified') as verified_registrations,
      COUNT(*) FILTER (WHERE teacher_verified = true) as teacher_verified_count
    FROM public.teams
  ),
  payment_stats AS (
    SELECT 
      COALESCE(SUM(amount) FILTER (WHERE payment_status = 'completed'), 0) as total_revenue
    FROM public.payments
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

-- 7) get_teams_with_member_count (admin-only)
CREATE OR REPLACE FUNCTION public.get_teams_with_member_count()
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
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

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
  FROM public.teams t
  LEFT JOIN public.team_members tm ON t.id = tm.team_id
  LEFT JOIN public.payments p ON t.id = p.team_id
  GROUP BY t.id, t.team_name, t.school_name, t.school_district, 
           t.lead_email, t.lead_phone, t.registration_status, 
           p.payment_status, t.created_at, t.teacher_verified
  ORDER BY t.created_at DESC;
END;
$$;

-- 8) get_payment_insights (admin-only)
CREATE OR REPLACE FUNCTION public.get_payment_insights()
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
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

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
    FROM public.payments
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

-- 9) get_paginated_teams (admin-only)
CREATE OR REPLACE FUNCTION public.get_paginated_teams(
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
SET search_path = public, pg_temp
AS $$
DECLARE
  total_teams bigint;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT COUNT(*) INTO total_teams
  FROM public.teams t
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
  FROM public.teams t
  LEFT JOIN public.team_members tm ON t.id = tm.team_id
  LEFT JOIN public.payments p ON t.id = p.team_id
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

-- 10) get_district_insights (admin-only)
CREATE OR REPLACE FUNCTION public.get_district_insights()
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
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT 
    t.school_district as district,
    COUNT(*) as total_teams,
    COUNT(DISTINCT t.school_name) as total_schools,
    COUNT(*) FILTER (WHERE t.registration_status = 'pending') as pending_teams,
    COUNT(*) FILTER (WHERE t.registration_status = 'shortlisted') as shortlisted_teams,
    COUNT(*) FILTER (WHERE t.registration_status = 'rejected') as rejected_teams,
    COUNT(*) FILTER (WHERE t.registration_status = 'verified') as verified_teams
  FROM public.teams t
  GROUP BY t.school_district
  ORDER BY total_teams DESC;
END;
$$;

-- 11) update_updated_at_column (trigger)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

-- 12) check_team_size (trigger)
CREATE OR REPLACE FUNCTION public.check_team_size()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (SELECT COUNT(*) FROM public.team_members WHERE team_id = NEW.team_id) >= 4 THEN
        RAISE EXCEPTION 'Team cannot have more than 4 members';
    END IF;
    RETURN NEW;
END;
$$;

-- 13) check_min_team_size (trigger)
CREATE OR REPLACE FUNCTION public.check_min_team_size()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (SELECT COUNT(*) FROM public.team_members WHERE team_id = OLD.team_id) < 2 THEN
        RAISE EXCEPTION 'Team must have at least 2 members';
    END IF;
    RETURN OLD;
END;
$$;

-- Tighten GRANTs for admin-only RPCs
REVOKE ALL ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.get_teams_with_member_count() FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.get_payment_insights() FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.get_paginated_teams(integer, integer, text, text, text) FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.get_district_insights() FROM PUBLIC, authenticated;

-- Grant to service role (or replace with your dedicated admin role)
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_teams_with_member_count() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_payment_insights() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_paginated_teams(integer, integer, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_district_insights() TO service_role;






