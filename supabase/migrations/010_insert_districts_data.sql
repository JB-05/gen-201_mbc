-- Insert Kerala districts data
-- This ensures districts are available even if the previous migration didn't work

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

-- Insert configuration data if not exists
INSERT INTO configuration (key, value, description) VALUES
    ('registration_fee', '50', 'Registration fee in rupees'),
    ('currency', 'INR', 'Default currency'),
    ('max_team_members', '4', 'Maximum team members including lead'),
    ('min_team_members', '2', 'Minimum team members including lead'),
    ('event_name', 'GEN 201', 'Event name'),
    ('event_description', 'Team Registration Fee', 'Event description for payments'),
    ('payment_theme_color', '#7303c0', 'Payment gateway theme color')
ON CONFLICT (key) DO NOTHING;
