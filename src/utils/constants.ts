// ============================================================
// நினைவு (Ninaivu) — Constants
// ============================================================

import type { ExpenseCategory, InvestmentType, TaskPriority, TaskStatus, IdeaCategory, MemoryCategory, HabitCategory } from '../types';

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard', section: 'Main' },
  { path: '/search', label: 'Search', icon: 'Search', section: 'Main' },
  { path: '/memory', label: 'Memory Vault', icon: 'Brain', section: 'Modules' },
  { path: '/study', label: 'Study Hub', icon: 'GraduationCap', section: 'Modules' },
  { path: '/finance', label: 'Finance', icon: 'Wallet', section: 'Modules' },
  { path: '/tasks', label: 'Tasks', icon: 'CheckSquare', section: 'Productivity' },
  { path: '/goals', label: 'Goals', icon: 'Target', section: 'Productivity' },
  { path: '/ideas', label: 'Ideas', icon: 'Lightbulb', section: 'Productivity' },
  { path: '/habits', label: 'Habits', icon: 'Activity', section: 'Productivity' },
  { path: '/statistics', label: 'Statistics', icon: 'TrendingUp', section: 'System' },
  { path: '/settings', label: 'Settings', icon: 'Settings', section: 'System' },
];

export const BOTTOM_NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'LayoutDashboard' },
  { path: '/study', label: 'Study', icon: 'GraduationCap' },
  { path: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
  { path: '/finance', label: 'Finance', icon: 'Wallet' },
  { path: '/habits', label: 'Habits', icon: 'Activity' },
  { path: '/memory', label: 'Memory', icon: 'Brain' },
];

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; color: string }> = {
  food: { label: 'Food & Dining', color: '#F59E0B' },
  travel: { label: 'Travel', color: '#3B82F6' },
  education: { label: 'Education', color: '#8B5CF6' },
  shopping: { label: 'Shopping', color: '#EC4899' },
  entertainment: { label: 'Entertainment', color: '#10B981' },
  health: { label: 'Health', color: '#EF4444' },
  bills: { label: 'Bills', color: '#6366F1' },
  other: { label: 'Other', color: '#64748B' },
};

export const INVESTMENT_TYPES: Record<InvestmentType, { label: string; color: string }> = {
  sip: { label: 'SIP / Mutual Fund', color: '#8B5CF6' },
  mutual_fund: { label: 'Lumpsum MF', color: '#3B82F6' },
  stocks: { label: 'Stocks', color: '#10B981' },
  fd: { label: 'Fixed Deposit', color: '#F59E0B' },
  crypto: { label: 'Crypto', color: '#EC4899' },
  other: { label: 'Other', color: '#64748B' },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  high: { label: 'High', color: 'var(--color-error)', bgColor: 'var(--color-error-light)' },
  medium: { label: 'Medium', color: 'var(--color-warning)', bgColor: 'var(--color-warning-light)' },
  low: { label: 'Low', color: 'var(--color-success)', bgColor: 'var(--color-success-light)' },
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'var(--text-secondary)', bgColor: 'var(--bg-card)' },
  in_progress: { label: 'In Progress', color: 'var(--color-info)', bgColor: 'var(--color-info-light)' },
  completed: { label: 'Completed', color: 'var(--color-success)', bgColor: 'var(--color-success-light)' },
};

export const IDEA_CATEGORIES: Record<IdeaCategory, { label: string; color: string }> = {
  app: { label: 'App Idea', color: '#8B5CF6' },
  business: { label: 'Business', color: '#10B981' },
  project: { label: 'Project', color: '#3B82F6' },
  research: { label: 'Research', color: '#F59E0B' },
  other: { label: 'Other', color: '#64748B' },
};

export const MEMORY_CATEGORIES: Record<MemoryCategory, { label: string; icon: string; color: string }> = {
  personal: { label: 'Personal Data', icon: 'User', color: '#3B82F6' },
  other: { label: 'Other', icon: 'FileText', color: '#64748B' },
};

export const TIMER_PRESETS = [15, 25, 45, 60, 90];

export const DEFAULT_SUBJECTS = [
  { name: 'Mathematics', color: '#3B82F6', icon: 'Calculator' },
  { name: 'Physics', color: '#8B5CF6', icon: 'Atom' },
  { name: 'Computer Science', color: '#10B981', icon: 'Terminal' },
  { name: 'Literature', color: '#EC4899', icon: 'BookOpen' },
];

export const HABIT_CATEGORIES: Record<HabitCategory, { label: string; color: string; icon: string }> = {
  health: { label: 'Health', color: '#EF4444', icon: 'Heart' },
  productivity: { label: 'Productivity', color: '#3B82F6', icon: 'Zap' },
  learning: { label: 'Learning', color: '#8B5CF6', icon: 'BookOpen' },
  fitness: { label: 'Fitness', color: '#F59E0B', icon: 'Activity' },
  mindfulness: { label: 'Mindfulness', color: '#10B981', icon: 'Wind' },
  finance: { label: 'Finance', color: '#6366F1', icon: 'DollarSign' },
  other: { label: 'Other', color: '#64748B', icon: 'Star' },
};
