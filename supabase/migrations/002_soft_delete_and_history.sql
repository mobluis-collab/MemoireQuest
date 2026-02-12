-- Soft delete: add deleted_at column to user_progress
ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Update RLS policies to exclude soft-deleted rows
DROP POLICY IF EXISTS "Users can read own data" ON user_progress;
CREATE POLICY "Users can read own data"
ON user_progress FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Analysis history: track previous analyses
CREATE TABLE IF NOT EXISTS user_analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quests JSONB NOT NULL,
  analysis JSONB,
  requirements_summary JSONB,
  domain TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS on analysis history
ALTER TABLE user_analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own history"
ON user_analysis_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
ON user_analysis_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
ON user_analysis_history FOR DELETE
USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id
ON user_analysis_history(user_id);
