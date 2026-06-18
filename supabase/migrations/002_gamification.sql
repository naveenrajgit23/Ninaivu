-- ============================================================
-- நினைவு (Ninaivu) — Migration 002: Gamification
-- Run this in the Supabase SQL editor
-- ============================================================

-- ── 1. Update Users Table ──
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_current INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_best INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date DATE;

-- ── 2. Achievements Table ──
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT 'Trophy',
    xp_reward INTEGER DEFAULT 50,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Note: Achievements are public read-only, admin insert.
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read achievements" ON achievements FOR SELECT USING (true);

-- ── 3. User Achievements ──
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, achievement_id)
);
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own achievements" ON user_achievements FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- ── 4. Weekly Summaries ──
CREATE TABLE IF NOT EXISTS weekly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    week_start_date DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    habits_completed INTEGER DEFAULT 0,
    xp_gained INTEGER DEFAULT 0,
    focus_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, week_start_date)
);
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own summaries" ON weekly_summaries FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user ON weekly_summaries(user_id);
