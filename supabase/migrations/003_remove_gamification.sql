-- ============================================================
-- நினைவு (Ninaivu) — Migration 003: Remove Gamification
-- Run this in the Supabase SQL editor
-- ============================================================

-- ── 1. Drop Gamification Tables ──
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;

-- ── 2. Remove Game Mechanics from Users ──
ALTER TABLE users DROP COLUMN IF EXISTS xp;
ALTER TABLE users DROP COLUMN IF EXISTS level;

-- Note: We keep streak_current, streak_best, and last_active_date 
-- as they are used for human-centered habit momentum.
-- We also keep weekly_summaries for the Weekly Reflection card.
