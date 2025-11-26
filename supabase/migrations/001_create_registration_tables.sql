-- Create enum types for consistent data (with IF NOT EXISTS for safety)
DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE grade_type AS ENUM ('11', '12');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE food_preference_type AS ENUM ('veg', 'non_veg', 'none');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE registration_status_type AS ENUM ('pending', 'shortlisted', 'rejected', 'verified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create teams table first
CREATE TABLE teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL UNIQUE,
    school_name VARCHAR(200) NOT NULL,
    school_district VARCHAR(100) NOT NULL,
    lead_phone VARCHAR(15) NOT NULL,
    lead_email VARCHAR(255) NOT NULL,
    registration_status registration_status_type DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Add constraints
    CONSTRAINT team_name_length CHECK (char_length(team_name) >= 3),
    CONSTRAINT school_name_length CHECK (char_length(school_name) >= 3),
    CONSTRAINT valid_phone CHECK (lead_phone ~ '^[0-9]{10}$'),
    CONSTRAINT valid_email CHECK (lead_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create admins table
CREATE TABLE admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create team members table
CREATE TABLE team_members (
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
    
    -- Add constraints
    CONSTRAINT name_length CHECK (char_length(name) >= 2),
    CONSTRAINT valid_phone CHECK (phone ~ '^[0-9]{10}$'),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create audit log for team status changes
CREATE TABLE team_status_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES admins(id),
    old_status registration_status_type,
    new_status registration_status_type NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_teams_registration_status ON teams(registration_status);

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create team size constraint function
CREATE OR REPLACE FUNCTION check_team_size()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM team_members WHERE team_id = NEW.team_id) >= 4 THEN
        RAISE EXCEPTION 'Team cannot have more than 4 members';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to enforce team size limit
CREATE TRIGGER enforce_team_size
    BEFORE INSERT ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION check_team_size();

-- Create function to ensure minimum team size
CREATE OR REPLACE FUNCTION check_min_team_size()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM team_members WHERE team_id = OLD.team_id) < 2 THEN
        RAISE EXCEPTION 'Team must have at least 2 members';
    END IF;
    RETURN OLD;
END;
$$ language 'plpgsql';

-- Create trigger to enforce minimum team size
CREATE TRIGGER enforce_min_team_size
    BEFORE DELETE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION check_min_team_size();