-- RLS Policies for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Anyone can create payments (for registration)
CREATE POLICY "Enable payment creation for all" ON payments
    FOR INSERT TO public
    WITH CHECK (true);

-- Only admins can read payment details
CREATE POLICY "Enable payment reading for admins" ON payments
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- Only admins can update payment status
CREATE POLICY "Enable payment updates for admins" ON payments
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- RLS Policies for project_details table
ALTER TABLE project_details ENABLE ROW LEVEL SECURITY;

-- Anyone can create project details
CREATE POLICY "Enable project details creation for all" ON project_details
    FOR INSERT TO public
    WITH CHECK (true);

-- Anyone can read project details (for display purposes)
CREATE POLICY "Allow reading project details" ON project_details
    FOR SELECT TO public
    USING (true);

-- Only admins can update project details
CREATE POLICY "Enable project details updates for admins" ON project_details
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- RLS Policies for teacher_verifications table
ALTER TABLE teacher_verifications ENABLE ROW LEVEL SECURITY;

-- Anyone can create teacher verifications
CREATE POLICY "Enable teacher verification creation for all" ON teacher_verifications
    FOR INSERT TO public
    WITH CHECK (true);

-- Anyone can read teacher verifications (for display purposes)
CREATE POLICY "Allow reading teacher verifications" ON teacher_verifications
    FOR SELECT TO public
    USING (true);

-- Only admins can update teacher verifications
CREATE POLICY "Enable teacher verification updates for admins" ON teacher_verifications
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Grant execute permissions on analytics functions to authenticated users
GRANT EXECUTE ON FUNCTION get_payment_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_district_analytics() TO authenticated;

-- Create function for admin dashboard statistics (with admin-only access)
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
    total_registrations BIGINT,
    pending_registrations BIGINT,
    shortlisted_registrations BIGINT,
    rejected_registrations BIGINT,
    verified_registrations BIGINT,
    paid_registrations BIGINT,
    total_revenue BIGINT,
    total_districts BIGINT,
    total_schools BIGINT
) AS $$
BEGIN
    -- Check if user is admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM teams)::BIGINT as total_registrations,
        (SELECT COUNT(*) FROM teams WHERE registration_status = 'pending')::BIGINT as pending_registrations,
        (SELECT COUNT(*) FROM teams WHERE registration_status = 'shortlisted')::BIGINT as shortlisted_registrations,
        (SELECT COUNT(*) FROM teams WHERE registration_status = 'rejected')::BIGINT as rejected_registrations,
        (SELECT COUNT(*) FROM teams WHERE registration_status = 'verified')::BIGINT as verified_registrations,
        (SELECT COUNT(*) FROM teams WHERE payment_status = 'completed')::BIGINT as paid_registrations,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'completed')::BIGINT as total_revenue,
        (SELECT COUNT(DISTINCT school_district) FROM teams)::BIGINT as total_districts,
        (SELECT COUNT(DISTINCT school_name) FROM teams)::BIGINT as total_schools;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Grant execute permission to authenticated users (function handles admin check internally)
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
