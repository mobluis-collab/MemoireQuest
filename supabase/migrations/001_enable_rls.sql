-- PRIORITY P0: Enable Row Level Security on user_progress
-- This prevents any user from reading/writing other users' data

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own data
CREATE POLICY "Users can read own data"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only INSERT their own data
CREATE POLICY "Users can insert own data"
ON user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own data
CREATE POLICY "Users can update own data"
ON user_progress FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own data
CREATE POLICY "Users can delete own data"
ON user_progress FOR DELETE
USING (auth.uid() = user_id);

-- Performance: Index on user_id
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id
ON user_progress(user_id);
