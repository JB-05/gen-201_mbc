-- Create configuration table for dynamic values
CREATE TABLE IF NOT EXISTS configuration (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default configuration values
INSERT INTO configuration (key, value, description) VALUES
    ('registration_fee', '50', 'Registration fee in rupees'),
    ('currency', 'INR', 'Default currency'),
    ('max_team_members', '4', 'Maximum team members including lead'),
    ('min_team_members', '2', 'Minimum team members including lead'),
    ('event_name', 'GEN 201', 'Event name'),
    ('event_description', 'Team Registration Fee', 'Event description for payments'),
    ('payment_theme_color', '#7303c0', 'Payment gateway theme color')
ON CONFLICT (key) DO NOTHING;

-- Create districts table for dynamic district management
CREATE TABLE IF NOT EXISTS districts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert Kerala districts
INSERT INTO districts (name, display_order) VALUES
    ('Alappuzha', 1),
    ('Ernakulam', 2),
    ('Idukki', 3),
    ('Kannur', 4),
    ('Kasaragod', 5),
    ('Kollam', 6),
    ('Kottayam', 7),
    ('Kozhikode', 8),
    ('Malappuram', 9),
    ('Palakkad', 10),
    ('Pathanamthitta', 11),
    ('Thiruvananthapuram', 12),
    ('Thrissur', 13),
    ('Wayanad', 14)
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_configuration_key ON configuration(key);
CREATE INDEX IF NOT EXISTS idx_districts_active ON districts(is_active);
CREATE INDEX IF NOT EXISTS idx_districts_order ON districts(display_order);

-- Create trigger for updated_at
CREATE TRIGGER update_configuration_updated_at
    BEFORE UPDATE ON configuration
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_districts_updated_at
    BEFORE UPDATE ON districts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to configuration and districts
CREATE POLICY "Allow public read access to configuration" ON configuration
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Allow public read access to districts" ON districts
    FOR SELECT TO public
    USING (true);

-- Only admins can modify configuration and districts
CREATE POLICY "Allow admin write access to configuration" ON configuration
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin write access to districts" ON districts
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
