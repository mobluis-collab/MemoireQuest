-- Migration: Add prestige mode support
-- Description: Add prestige_count column to memoir_plans for "New Game+" functionality

ALTER TABLE memoir_plans
ADD COLUMN IF NOT EXISTS prestige_count INT DEFAULT 0 NOT NULL;

-- Add index for querying users by prestige level
CREATE INDEX IF NOT EXISTS idx_memoir_plans_prestige_count
ON memoir_plans(prestige_count DESC);

-- Comment for documentation
COMMENT ON COLUMN memoir_plans.prestige_count IS 'Number of times user has reset progress in Prestige Mode after reaching level 10 with 100% completion';
