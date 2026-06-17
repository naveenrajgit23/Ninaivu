// ============================================================
// நினைவு (Ninaivu) — Types
// ============================================================

export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  theme?: Theme;
  app_lock_enabled?: boolean;
}

export type MemoryCategory = 'personal' | 'other';

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  title: string;
  data: Record<string, string>;
  is_favorite: boolean;
  is_encrypted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Note {
  id: string;
  subject_id: string | null;
  title: string;
  content: string;
  type: 'note' | 'important_question' | 'pyq' | 'assignment';
  tags: string[];
  created_at?: string;
}

export interface Exam {
  id: string;
  subject_id: string | null;
  title: string;
  exam_date: string;
  notes: string;
}

export interface StudySession {
  id: string;
  duration_minutes: number;
  started_at: string;
  ended_at: string;
}

export type ExpenseCategory = 'food' | 'travel' | 'education' | 'shopping' | 'entertainment' | 'health' | 'bills' | 'other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  expense_date: string;
}

export type MoneyStatus = 'pending' | 'returned';

export interface MoneyTracker {
  id: string;
  person_name: string;
  amount: number;
  given_date: string;
  due_date: string | null;
  status: MoneyStatus;
  notes: string;
}

export type InvestmentType = 'sip' | 'mutual_fund' | 'stocks' | 'fd' | 'crypto' | 'other';

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  invested_amount: number;
  current_value: number | null;
  notes: string;
}

export type GoalStatus = 'active' | 'completed' | 'paused';

export interface Goal {
  id: string;
  title: string;
  description: string;
  target_date: string | null;
  progress: number;
  status: GoalStatus;
}

export type TaskType = 'general' | 'daily' | 'weekly';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  goal_id: string | null;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  reminder_at: string | null;
  completed_at: string | null;
}

export type IdeaCategory = 'app' | 'business' | 'project' | 'research' | 'other';

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  tags: string[];
  is_favorite: boolean;
  created_at?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export type SearchResult = {
  id: string;
  type: 'memory' | 'note' | 'subject' | 'expense' | 'task' | 'goal' | 'idea';
  title: string;
  subtitle: string;
  path: string;
};

export type TimerStatus = 'idle' | 'running' | 'paused';

export type HabitCategory = 'health' | 'productivity' | 'learning' | 'fitness' | 'mindfulness' | 'finance' | 'other';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  title: string;
  description: string;
  category: HabitCategory;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  target_count: number;
  start_date: string;
  reminder_time: string | null;
  goal_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_date: string;
  created_at?: string;
}
