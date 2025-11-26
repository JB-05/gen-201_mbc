-- Helper function to check if user is admin (in public schema)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE auth_user_id = auth.uid()
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- RLS Policies for teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Anyone can create a team
CREATE POLICY "Enable team creation for all" ON teams
    FOR INSERT TO public
    WITH CHECK (true);

-- Anyone can read team names (for duplicate checking)
CREATE POLICY "Allow reading team names" ON teams
    FOR SELECT TO public
    USING (true);

-- Only admins can update team status
CREATE POLICY "Enable team updates for admins" ON teams
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- RLS Policies for team_members table
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Anyone can create team members
CREATE POLICY "Enable team member creation for all" ON team_members
    FOR INSERT TO public
    WITH CHECK (true);

-- Anyone can read team members
CREATE POLICY "Allow reading team members" ON team_members
    FOR SELECT TO public
    USING (true);

-- Only admins can update team members
CREATE POLICY "Enable team member updates for admins" ON team_members
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- RLS Policies for admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Only admins can manage other admins
CREATE POLICY "Enable admin management" ON admins
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- RLS Policies for team_status_logs table
ALTER TABLE team_status_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can create status logs
CREATE POLICY "Enable status log creation for admins" ON team_status_logs
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

-- Only admins can read status logs
CREATE POLICY "Enable status log viewing for admins" ON team_status_logs
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- Create function to log team status changes
CREATE OR REPLACE FUNCTION log_team_status_change()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
BEGIN
    -- Get admin_id from auth.uid()
    SELECT id INTO admin_id FROM admins WHERE auth_user_id = auth.uid();
    
    IF NEW.registration_status != OLD.registration_status THEN
        INSERT INTO team_status_logs (
            team_id,
            admin_id,
            old_status,
            new_status
        ) VALUES (
            NEW.id,
            admin_id,
            OLD.registration_status,
            NEW.registration_status
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for logging status changes
CREATE TRIGGER log_team_status_changes
    AFTER UPDATE OF registration_status ON teams
    FOR EACH ROW
    EXECUTE FUNCTION log_team_status_change();
