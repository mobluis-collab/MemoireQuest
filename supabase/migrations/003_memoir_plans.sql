CREATE TABLE memoir_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE memoir_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_plans" ON memoir_plans
  FOR ALL USING (auth.uid() = user_id);
