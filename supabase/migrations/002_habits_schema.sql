-- ============================================================
-- நினைவு (Ninaivu) — Habits Schema (Migration 002)
-- ============================================================

-- ── Habits ──
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'health',
    icon TEXT DEFAULT 'Activity',
    color TEXT DEFAULT '#10B981',
    frequency TEXT DEFAULT 'daily',
    target_count INTEGER DEFAULT 1,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reminder_time TIME,
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own habits" ON habits FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- ── Habit Completions ──
CREATE TABLE IF NOT EXISTS habit_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
    completed_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure a habit can only be completed once per day (or target_count times, but usually simplified to one record per date)
-- If we want to support multiple times a day, we might remove the unique constraint, but for now a single completion per date per habit is common.
ALTER TABLE habit_completions ADD CONSTRAINT unique_habit_date UNIQUE (habit_id, completed_date);

ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own habit completions" ON habit_completions FOR ALL USING (
    habit_id IN (SELECT id FROM habits WHERE user_id = (SELECT auth.uid()))
) WITH CHECK (
    habit_id IN (SELECT id FROM habits WHERE user_id = (SELECT auth.uid()))
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_goal ON habits(goal_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completed_date);
