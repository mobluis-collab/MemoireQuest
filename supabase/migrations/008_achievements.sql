-- Migration 008 : Ajouter le système de badges/achievements
ALTER TABLE memoir_plans ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '{}';
