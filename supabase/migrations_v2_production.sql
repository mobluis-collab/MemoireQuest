-- ========================================
-- maimouarkwest v2.0 - MIGRATIONS PRODUCTION
-- Date: 2026-02-26
-- Apply these in Supabase SQL Editor
-- ========================================

-- ----------------------------------------
-- Migration 007: Convertir sections vers objets avec difficulty
-- ----------------------------------------
UPDATE memoir_plans
SET plan_data = (
  SELECT jsonb_build_object(
    'title', plan_data->'title',
    'chapters', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'number', chapter->'number',
          'title', chapter->'title',
          'objective', chapter->'objective',
          'sections', (
            SELECT jsonb_agg(
              jsonb_build_object('text', section, 'difficulty', 'medium')
            )
            FROM jsonb_array_elements_text(chapter->'sections') section
          ),
          'tips', chapter->'tips'
        )
      )
      FROM jsonb_array_elements(plan_data->'chapters') chapter
    )
  )
)
WHERE plan_data IS NOT NULL;

-- ----------------------------------------
-- Migration 008: Système badges/achievements
-- ----------------------------------------
ALTER TABLE memoir_plans ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '{}';

-- ----------------------------------------
-- Migration 009: Système combo
-- ----------------------------------------
ALTER TABLE memoir_plans
ADD COLUMN IF NOT EXISTS combo_state JSONB DEFAULT '{"count": 0, "lastQuestTime": null}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_memoir_plans_combo_state ON memoir_plans USING gin (combo_state);

COMMENT ON COLUMN memoir_plans.combo_state IS 'Stores combo state: { count: number, lastQuestTime: number | null }';

-- ----------------------------------------
-- Migration 010: Prestige Mode
-- ----------------------------------------
ALTER TABLE memoir_plans
ADD COLUMN IF NOT EXISTS prestige_count INT DEFAULT 0 NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memoir_plans_prestige_count
ON memoir_plans(prestige_count DESC);

COMMENT ON COLUMN memoir_plans.prestige_count IS 'Number of times user has reset progress in Prestige Mode after reaching level 10 with 100% completion';

-- ========================================
-- FIN MIGRATIONS v2.0
-- ========================================
