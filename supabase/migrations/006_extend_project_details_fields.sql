-- Extend project_details with detailed idea submission fields
-- Columns are added as nullable to avoid breaking existing rows

ALTER TABLE project_details
    ADD COLUMN IF NOT EXISTS idea_title VARCHAR(200),
    ADD COLUMN IF NOT EXISTS problem_statement TEXT,
    ADD COLUMN IF NOT EXISTS solution_idea TEXT,
    ADD COLUMN IF NOT EXISTS implementation_plan TEXT,
    ADD COLUMN IF NOT EXISTS beneficiaries VARCHAR(200),
    ADD COLUMN IF NOT EXISTS teamwork_contribution TEXT;

-- Optional: indexes for potential filtering/searching later
CREATE INDEX IF NOT EXISTS idx_project_details_idea_title ON project_details(idea_title);

