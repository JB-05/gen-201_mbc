-- Create payment status enum (with safe creation)
DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payments table for Razorpay integration
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    payment_id VARCHAR(100) UNIQUE, -- Razorpay payment ID (null for pending payments)
    signature VARCHAR(200), -- Razorpay signature for verification
    amount INTEGER NOT NULL DEFAULT 5000, -- Amount in paise (₹50 = 5000 paise)
    currency VARCHAR(3) DEFAULT 'INR',
    payment_status payment_status_type DEFAULT 'pending',
    payment_method VARCHAR(50), -- card, netbanking, upi, wallet, etc.
    razorpay_order_id VARCHAR(100), -- Original Razorpay order ID
    failure_reason TEXT, -- Reason for payment failure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Add constraints
    CONSTRAINT valid_amount CHECK (amount > 0),
    CONSTRAINT payment_id_required_when_completed CHECK (
        (payment_status = 'completed' AND payment_id IS NOT NULL) OR 
        (payment_status != 'completed')
    )
);

-- Add payment_status column to teams table
ALTER TABLE teams ADD COLUMN payment_status payment_status_type DEFAULT 'pending';

-- Create project details table
CREATE TABLE project_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    project_name VARCHAR(200) NOT NULL,
    project_field VARCHAR(100) NOT NULL,
    project_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Add constraints
    CONSTRAINT project_name_length CHECK (char_length(project_name) >= 3),
    CONSTRAINT project_description_length CHECK (char_length(project_description) >= 50 AND char_length(project_description) <= 500)
);

-- Create teacher verifications table
CREATE TABLE teacher_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    salutation VARCHAR(10) NOT NULL CHECK (salutation IN ('sir', 'maam')),
    teacher_name VARCHAR(100) NOT NULL,
    teacher_phone VARCHAR(15) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Add constraints
    CONSTRAINT teacher_name_length CHECK (char_length(teacher_name) >= 2),
    CONSTRAINT valid_teacher_phone CHECK (teacher_phone ~ '^[0-9]{10}$')
);

-- Create indexes for better performance
CREATE INDEX idx_payments_team_id ON payments(team_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payment_id ON payments(payment_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_project_details_team_id ON project_details(team_id);
CREATE INDEX idx_teacher_verifications_team_id ON teacher_verifications(team_id);
CREATE INDEX idx_teams_payment_status ON teams(payment_status);

-- Create triggers for updated_at columns
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_details_updated_at
    BEFORE UPDATE ON project_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_verifications_updated_at
    BEFORE UPDATE ON teacher_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to sync payment status with team
CREATE OR REPLACE FUNCTION sync_team_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update team payment status when payment status changes
    UPDATE teams 
    SET payment_status = NEW.payment_status 
    WHERE id = NEW.team_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to sync payment status
CREATE TRIGGER sync_team_payment_status_trigger
    AFTER UPDATE OF payment_status ON payments
    FOR EACH ROW
    EXECUTE FUNCTION sync_team_payment_status();

-- Create function for payment analytics
CREATE OR REPLACE FUNCTION get_payment_analytics()
RETURNS TABLE (
    total_revenue BIGINT,
    completed_payments BIGINT,
    pending_payments BIGINT,
    failed_payments BIGINT,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_payments,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2)
            ELSE 0 
        END as conversion_rate
    FROM payments;
END;
$$ language 'plpgsql';

-- Create function for district-wise analytics
CREATE OR REPLACE FUNCTION get_district_analytics()
RETURNS TABLE (
    district VARCHAR(100),
    total_teams BIGINT,
    unique_schools BIGINT,
    pending_teams BIGINT,
    shortlisted_teams BIGINT,
    rejected_teams BIGINT,
    verified_teams BIGINT,
    paid_teams BIGINT
) AS $$
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
    FROM teams t
    GROUP BY t.school_district
    ORDER BY total_teams DESC;
END;
$$ language 'plpgsql';
