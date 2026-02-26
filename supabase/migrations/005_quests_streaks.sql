ALTER TABLE memoir_plans ADD COLUMN IF NOT EXISTS quest_progress JSONB DEFAULT '{}';
ALTER TABLE memoir_plans ADD COLUMN IF NOT EXISTS total_points INT DEFAULT 0;
ALTER TABLE memoir_plans ADD COLUMN IF NOT EXISTS streak_data JSONB DEFAULT '{"current":0,"last_activity":null,"jokers":1}';
