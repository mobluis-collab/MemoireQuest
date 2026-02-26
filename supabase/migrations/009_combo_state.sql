-- Migration: Add combo_state JSONB column to memoir_plans
-- Date: 2026-02-26

ALTER TABLE memoir_plans
ADD COLUMN IF NOT EXISTS combo_state JSONB DEFAULT '{"count": 0, "lastQuestTime": null}'::jsonb;

-- Index for faster JSONB queries on combo_state
CREATE INDEX IF NOT EXISTS idx_memoir_plans_combo_state ON memoir_plans USING gin (combo_state);

-- Comment
COMMENT ON COLUMN memoir_plans.combo_state IS 'Stores combo state: { count: number, lastQuestTime: number | null }';
