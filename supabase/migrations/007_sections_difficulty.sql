-- Migration 007 : Convertir sections string[] vers Section[] (objet avec text + difficulty)
-- Assigner difficulty='medium' par défaut aux sections existantes

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
