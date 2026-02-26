ALTER TABLE memoir_plans ADD COLUMN IF NOT EXISTS chapter_progress JSONB DEFAULT '{}';
