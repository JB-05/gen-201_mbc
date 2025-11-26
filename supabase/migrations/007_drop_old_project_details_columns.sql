-- Backfill new columns from old columns before dropping them
-- Idea: copy project_name -> idea_title when idea_title is null
--       copy project_description -> problem_statement when problem_statement is null

UPDATE project_details
SET idea_title = COALESCE(idea_title, project_name)
WHERE idea_title IS NULL AND project_name IS NOT NULL;

UPDATE project_details
SET problem_statement = COALESCE(problem_statement, project_description)
WHERE problem_statement IS NULL AND project_description IS NOT NULL;

-- Safely drop old columns now that data is backfilled
ALTER TABLE project_details
    DROP COLUMN IF EXISTS project_name,
    DROP COLUMN IF EXISTS project_field,
    DROP COLUMN IF EXISTS project_description;

