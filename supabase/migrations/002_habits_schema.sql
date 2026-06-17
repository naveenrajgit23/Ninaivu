-- ============================================================
-- நினைவு (Ninaivu) — Habits Schema Migration
-- ============================================================

-- ── Habits Table ──
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT NOT NULL,
    icon TEXT DEFAULT 'Flame',
    color TEXT DEFAULT '#6366F1',
    frequency TEXT NOT NULL DEFAULT 'daily',
    target_count INTEGER NOT NULL DEFAULT 1,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reminder_time TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own habits" ON habits 
    FOR ALL 
    USING ((select auth.uid()) = user_id) 
    WITH CHECK ((select auth.uid()) = user_id);

-- ── Habit Completions Table ──
CREATE TABLE IF NOT EXISTS habit_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own habit_completions" ON habit_completions 
    FOR ALL 
    USING ((select auth.uid()) = user_id) 
    WITH CHECK ((select auth.uid()) = user_id);

-- ── Indices ──
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_goal ON habits(goal_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user ON habit_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit ON habit_completions(habit_id);
