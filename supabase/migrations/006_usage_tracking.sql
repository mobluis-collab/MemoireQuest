CREATE TABLE IF NOT EXISTS usage_tracking (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INT DEFAULT 0,
  PRIMARY KEY (user_id, endpoint, date)
);
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_usage" ON usage_tracking
  FOR ALL USING (auth.uid() = user_id);
