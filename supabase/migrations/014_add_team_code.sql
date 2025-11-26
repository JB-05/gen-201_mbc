-- Add team_code to teams for human-friendly identifier
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS team_code VARCHAR(32);

-- Ensure uniqueness and quick lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_team_code_unique ON teams(team_code);
