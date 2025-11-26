-- Consolidated schema for GEN-201_MBC (combines migrations 001–016)
-- Safe to run on a fresh database. Uses IF NOT EXISTS where appropriate and final function definitions.

-- ============================
-- ENUM TYPES
-- ============================
DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE grade_type AS ENUM ('11', '12');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE food_preference_type AS ENUM ('veg', 'non_veg', 'none');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE registration_status_type AS ENUM ('pending', 'shortlisted', 'rejected', 'verified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================
-- TABLES
-- ============================
CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL UNIQUE,
    school_name VARCHAR(200) NOT NULL,
    school_district VARCHAR(100) NOT NULL,
    lead_phone VARCHAR(15) NOT NULL,
    lead_email VARCHAR(255) NOT NULL,
    registration_status registration_status_type DEFAULT 'pending',
    payment_status payment_status_type DEFAULT 'pending',
    teacher_verified BOOLEAN DEFAULT false,
    team_code VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT team_name_length CHECK (char_length(team_name) >= 3),
    CONSTRAINT school_name_length CHECK (char_length(school_name) >= 3),
    CONSTRAINT valid_phone CHECK (lead_phone ~ '^[0-9]{10}$'),
    CONSTRAINT valid_email CHECK (lead_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_team_code_unique ON teams(team_code);

CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    gender gender_type NOT NULL,
    grade grade_type NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL,
    food_preference food_preference_type DEFAULT 'none',
    is_team_lead BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT name_length CHECK (char_length(name) >= 2),
    CONSTRAINT valid_phone CHECK (phone ~ '^[0-9]{10}$'),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE IF NOT EXISTS team_status_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES admins(id),
    old_status registration_status_type,
    new_status registration_status_type NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    payment_id VARCHAR(100) UNIQUE,
    signature VARCHAR(200),
    amount INTEGER NOT NULL DEFAULT 5000,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_status payment_status_type DEFAULT 'pending',
    payment_method VARCHAR(50),
    razorpay_order_id VARCHAR(100),
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_amount CHECK (amount > 0),
    CONSTRAINT payment_id_required_when_completed CHECK (
        (payment_status = 'completed' AND payment_id IS NOT NULL) OR 
        (payment_status != 'completed')
    )
);

CREATE TABLE IF NOT EXISTS project_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    idea_title VARCHAR(200),
    problem_statement TEXT,
    solution_idea TEXT,
    implementation_plan TEXT,
    beneficiaries VARCHAR(200),
    teamwork_contribution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS teacher_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    salutation VARCHAR(10) NOT NULL CHECK (salutation IN ('sir', 'maam')),
    teacher_name VARCHAR(100) NOT NULL,
    teacher_phone VARCHAR(15) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT teacher_name_length CHECK (char_length(teacher_name) >= 2),
    CONSTRAINT valid_teacher_phone CHECK (teacher_phone ~ '^[0-9]{10}$')
);

CREATE TABLE IF NOT EXISTS configuration (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS districts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================
-- INDEXES
-- ============================
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_registration_status ON teams(registration_status);
CREATE INDEX IF NOT EXISTS idx_teams_school_district ON teams(school_district);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_status_district ON teams(registration_status, school_district);
CREATE INDEX IF NOT EXISTS idx_teams_created_status ON teams(created_at DESC, registration_status);
CREATE INDEX IF NOT EXISTS idx_teams_teacher_verified ON teams(teacher_verified, registration_status);
CREATE INDEX IF NOT EXISTS idx_payments_team_id ON payments(team_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_details_team_id ON project_details(team_id);
CREATE INDEX IF NOT EXISTS idx_project_details_idea_title ON project_details(idea_title);
CREATE INDEX IF NOT EXISTS idx_teacher_verifications_team_id ON teacher_verifications(team_id);
CREATE INDEX IF NOT EXISTS idx_districts_active ON districts(is_active);
CREATE INDEX IF NOT EXISTS idx_districts_order ON districts(display_order);

-- ============================
-- TRIGGER FUNCTIONS
-- ============================
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

-- ============================
-- TRIGGERS
-- ============================
DO $$ BEGIN
    CREATE TRIGGER update_teams_updated_at
        BEFORE UPDATE ON teams
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_team_members_updated_at
        BEFORE UPDATE ON team_members
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_payments_updated_at
        BEFORE UPDATE ON payments
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_project_details_updated_at
        BEFORE UPDATE ON project_details
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_teacher_verifications_updated_at
        BEFORE UPDATE ON teacher_verifications
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER enforce_team_size
        BEFORE INSERT ON team_members
        FOR EACH ROW
        EXECUTE FUNCTION check_team_size();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER enforce_min_team_size
        BEFORE DELETE ON team_members
        FOR EACH ROW
        EXECUTE FUNCTION check_min_team_size();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Log status changes
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
        INSERT INTO public.team_status_logs (team_id, admin_id, old_status, new_status)
        VALUES (NEW.id, v_admin_id, OLD.registration_status, NEW.registration_status);
    END IF;
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    CREATE TRIGGER log_team_status_changes
        AFTER UPDATE OF registration_status ON teams
        FOR EACH ROW
        EXECUTE FUNCTION log_team_status_change();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sync team payment status
CREATE OR REPLACE FUNCTION public.sync_team_payment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.teams SET payment_status = NEW.payment_status WHERE id = NEW.team_id;
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    CREATE TRIGGER sync_team_payment_status_trigger
        AFTER UPDATE OF payment_status ON payments
        FOR EACH ROW
        EXECUTE FUNCTION sync_team_payment_status();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================
-- FUNCTIONS (SECURITY + ANALYTICS)
-- ============================
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
        CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(CASE WHEN p.payment_status = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2) ELSE 0 END
    FROM public.payments p;
END;
$$;

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

-- Admin-only analytics (guarded + hardened)
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
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
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
    SELECT COALESCE(SUM(amount) FILTER (WHERE payment_status = 'completed'), 0) as total_revenue FROM public.payments
  )
  SELECT ts.total_registrations, ts.pending_registrations, ts.shortlisted_registrations, ts.rejected_registrations, ts.verified_registrations, ts.teacher_verified_count, ps.total_revenue
  FROM team_stats ts, payment_stats ps;
END;
$$;

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
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
  SELECT t.id, t.team_name, t.school_name, t.school_district, t.lead_email, t.lead_phone, t.registration_status, COALESCE(p.payment_status, 'pending'), t.created_at, COUNT(tm.id), t.teacher_verified
  FROM public.teams t
  LEFT JOIN public.team_members tm ON t.id = tm.team_id
  LEFT JOIN public.payments p ON t.id = p.team_id
  GROUP BY t.id, t.team_name, t.school_name, t.school_district, t.lead_email, t.lead_phone, t.registration_status, p.payment_status, t.created_at, t.teacher_verified
  ORDER BY t.created_at DESC;
END;
$$;

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
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
  WITH payment_stats AS (
    SELECT COUNT(*) as total_payments,
           COUNT(*) FILTER (WHERE payment_status = 'completed') as completed_payments,
           COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_payments,
           COUNT(*) FILTER (WHERE payment_status = 'failed') as failed_payments,
           COALESCE(SUM(amount) FILTER (WHERE payment_status = 'completed'), 0) as total_revenue,
           AVG(CASE WHEN payment_status = 'completed' THEN EXTRACT(EPOCH FROM (updated_at - created_at))/60.0 END) as avg_time_minutes
    FROM public.payments
  )
  SELECT ps.total_revenue, ps.completed_payments, ps.pending_payments, ps.failed_payments,
         CASE WHEN ps.total_payments > 0 THEN (ps.completed_payments::numeric / ps.total_payments::numeric) * 100 ELSE 0 END,
         COALESCE(ps.avg_time_minutes, 0)
  FROM payment_stats ps;
END;
$$;

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
DECLARE total_teams bigint; BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  SELECT COUNT(*) INTO total_teams FROM public.teams t
  WHERE (status_filter IS NULL OR t.registration_status = status_filter)
    AND (district_filter IS NULL OR t.school_district = district_filter)
    AND (search_term IS NULL OR t.team_name ILIKE '%'||search_term||'%' OR t.school_name ILIKE '%'||search_term||'%' OR t.lead_email ILIKE '%'||search_term||'%');
  RETURN QUERY
  SELECT t.id, t.team_name, t.school_name, t.school_district, t.lead_email, t.lead_phone, t.registration_status,
         COALESCE(p.payment_status, 'pending'), t.created_at, COUNT(tm.id), t.teacher_verified, total_teams
  FROM public.teams t
  LEFT JOIN public.team_members tm ON t.id = tm.team_id
  LEFT JOIN public.payments p ON t.id = p.team_id
  WHERE (status_filter IS NULL OR t.registration_status = status_filter)
    AND (district_filter IS NULL OR t.school_district = district_filter)
    AND (search_term IS NULL OR t.team_name ILIKE '%'||search_term||'%' OR t.school_name ILIKE '%'||search_term||'%' OR t.lead_email ILIKE '%'||search_term||'%')
  GROUP BY t.id, t.team_name, t.school_name, t.school_district, t.lead_email, t.lead_phone, t.registration_status, p.payment_status, t.created_at, t.teacher_verified
  ORDER BY t.created_at DESC
  LIMIT page_limit OFFSET page_offset;
END;
$$;

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
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  RETURN QUERY
  SELECT t.school_district, COUNT(*), COUNT(DISTINCT t.school_name),
         COUNT(*) FILTER (WHERE t.registration_status = 'pending'),
         COUNT(*) FILTER (WHERE t.registration_status = 'shortlisted'),
         COUNT(*) FILTER (WHERE t.registration_status = 'rejected'),
         COUNT(*) FILTER (WHERE t.registration_status = 'verified')
  FROM public.teams t
  GROUP BY t.school_district
  ORDER BY COUNT(*) DESC;
END;
$$;

-- Utility test function
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
RETURNS TABLE(column_name text, data_type text)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.column_name::text, c.data_type::text
    FROM information_schema.columns c
    WHERE c.table_name = get_table_columns.table_name
      AND c.table_schema = 'public'
    ORDER BY c.ordinal_position;
END;
$$;

-- ============================
-- RLS POLICIES
-- ============================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Teams
DO $$ BEGIN
    CREATE POLICY "Enable team creation for all" ON teams FOR INSERT TO public WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow reading team names" ON teams FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Enable team updates for admins" ON teams FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Team members
DO $$ BEGIN
    CREATE POLICY "Enable team member creation for all" ON team_members FOR INSERT TO public WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow reading team members" ON team_members FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Enable team member updates for admins" ON team_members FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admins
DO $$ BEGIN
    CREATE POLICY "Enable admin management" ON admins FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Team status logs
DO $$ BEGIN
    CREATE POLICY "Enable status log creation for admins" ON team_status_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Enable status log viewing for admins" ON team_status_logs FOR SELECT TO authenticated USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Configuration and Districts: public read, admin writes (split policies)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow admin write access to configuration" ON public.configuration;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow admin write access to districts" ON public.districts;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public read access to configuration" ON configuration FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public read access to districts" ON districts FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admin insert configuration" ON public.configuration FOR INSERT TO authenticated WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admin update configuration" ON public.configuration FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admin delete configuration" ON public.configuration FOR DELETE TO authenticated USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admin insert districts" ON public.districts FOR INSERT TO authenticated WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admin update districts" ON public.districts FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admin delete districts" ON public.districts FOR DELETE TO authenticated USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================
-- GRANTS (tightened for admin RPCs)
-- ============================
REVOKE ALL ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.get_teams_with_member_count() FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.get_payment_insights() FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.get_paginated_teams(integer, integer, text, text, text) FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.get_district_insights() FROM PUBLIC, authenticated;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_teams_with_member_count() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_payment_insights() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_paginated_teams(integer, integer, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_district_insights() TO service_role;

-- Utility function grants
GRANT EXECUTE ON FUNCTION public.get_table_columns(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_columns(text) TO public;

-- ============================
-- SEED DATA
-- ============================
INSERT INTO districts (name, display_order, is_active) VALUES
    ('Alappuzha', 1, true),
    ('Ernakulam', 2, true),
    ('Idukki', 3, true),
    ('Kannur', 4, true),
    ('Kasaragod', 5, true),
    ('Kollam', 6, true),
    ('Kottayam', 7, true),
    ('Kozhikode', 8, true),
    ('Malappuram', 9, true),
    ('Palakkad', 10, true),
    ('Pathanamthitta', 11, true),
    ('Thiruvananthapuram', 12, true),
    ('Thrissur', 13, true),
    ('Wayanad', 14, true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO configuration (key, value, description) VALUES
    ('registration_fee', '50', 'Registration fee in rupees'),
    ('currency', 'INR', 'Default currency'),
    ('max_team_members', '4', 'Maximum team members including lead'),
    ('min_team_members', '2', 'Minimum team members including lead'),
    ('event_name', 'GEN 201', 'Event name'),
    ('event_description', 'Team Registration Fee', 'Event description for payments'),
    ('payment_theme_color', '#7303c0', 'Payment gateway theme color')
ON CONFLICT (key) DO NOTHING;

-- Optional data correction from migration 008 (amount rupees)
UPDATE payments
SET amount = amount / 100
WHERE amount IS NOT NULL AND amount >= 100 AND amount % 100 = 0;

ALTER TABLE payments
    ADD CONSTRAINT IF NOT EXISTS payments_amount_rupees_positive CHECK (amount > 0);

-- End of consolidated schema





