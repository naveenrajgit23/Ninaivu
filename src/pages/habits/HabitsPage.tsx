// ============================================================
// நினைவு (Ninaivu) — Habits Page
// ============================================================

import { useState } from 'react';
import { Activity, Plus, Flame, Check, TrendingUp } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { HABIT_CATEGORIES } from '../../utils/constants';
import ProgressRing from '../../components/ui/ProgressRing';
import type { HabitCategory, HabitFrequency } from '../../types';
import * as Icons from 'lucide-react';

type IconName = keyof typeof Icons;
function getIcon(name: string, size = 20) {
  const Comp = Icons[name as IconName] as React.ComponentType<{ size: number }>;
  return Comp ? <Comp size={size} /> : null;
}

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HabitsPage() {
  const { habits, habitCompletions, addItem, deleteItem } = useData();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'health' as HabitCategory,
    frequency: 'daily' as HabitFrequency,
    target_count: 1,
    goal_id: ''
  });

  const todayStr = getLocalDateString(new Date());

  // Derived Stats
  const activeHabits = habits; // Simplification for demo
  const todaysCompletions = habitCompletions.filter(c => c.completed_date === todayStr);
  const completedTodayCount = todaysCompletions.length;
  
  const completionRate = activeHabits.length > 0
    ? Math.round((completedTodayCount / activeHabits.length) * 100)
    : 0;

  // Simplified streak calculation for demo
  const calculateStreak = (habitId: string) => {
    const dates = habitCompletions
      .filter(c => c.habit_id === habitId)
      .map(c => c.completed_date)
      .sort((a, b) => b.localeCompare(a));
    
    if (dates.length === 0) return 0;
    
    let current = 0;
    const dateSet = new Set(dates);
    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);
    
    // Check if done today
    if (dateSet.has(getLocalDateString(checkDate))) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
      while(dateSet.has(getLocalDateString(checkDate))) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      while(dateSet.has(getLocalDateString(checkDate))) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    return current;
  };

  const bestOverallStreak = habits.reduce((max, h) => {
    const s = calculateStreak(h.id);
    return s > max ? s : max;
  }, 0);

  // Weekly completions tracking (last 7 days ending today)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return getLocalDateString(d);
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekData = last7Days.map(dateStr => {
    const d = new Date(dateStr);
    const dayName = weekDays[d.getDay()][0]; // 'M', 'T', etc.
    const isTodayStr = dateStr === todayStr;
    const completionsCount = habitCompletions.filter(c => c.completed_date === dateStr).length;
    const isDone = habits.length > 0 && completionsCount > 0;
    return { dayName, isDone, isToday: isTodayStr, dateStr };
  });

  const completedDaysThisWeek = weekData.filter(w => w.isDone).length;
  const weekProgressPct = habits.length > 0 ? Math.round((completedDaysThisWeek / 7) * 100) : 0;

  // Handlers
  const handleSaveHabit = async () => {
    if (!form.title.trim()) return;
    const catConfig = HABIT_CATEGORIES[form.category];
    await addItem('habits', {
      ...form,
      icon: catConfig.icon,
      color: catConfig.color,
      start_date: todayStr,
      goal_id: form.goal_id || null
    });
    setShowModal(false);
    showToast('Habit created!', 'success');
    setForm({ title: '', description: '', category: 'health', frequency: 'daily', target_count: 1, goal_id: '' });
  };

  const toggleHabit = async (habitId: string) => {
    const existing = habitCompletions.find(c => c.habit_id === habitId && c.completed_date === todayStr);
    if (existing) {
      await deleteItem('habitCompletions', existing.id);
      showToast('Habit completion undone', 'info');
    } else {
      await addItem('habitCompletions', { habit_id: habitId, completed_date: todayStr });
      showToast('Habit marked complete! 🎉', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this habit? History will be lost.')) {
      await deleteItem('habits', id);
      showToast('Habit deleted', 'success');
    }
  };

  return (
    <>
      <TopBar title="Habits" subtitle="Build better routines" />

      <div className="page">
        {/* Top Stats */}
        <div className="grid grid-4 animate-fadeInUp" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card" style={{ padding: 'var(--space-4)', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', width: 36, height: 36 }}>
                <Activity size={18} />
              </div>
              <span className="text-xs font-medium text-secondary">Active Habits</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{activeHabits.length}</div>
            <div className="text-xs text-muted mb-4">Keep it up!</div>
            <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 30 }} viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,15 Q25,30 50,15 T100,15 L100,30 L0,30 Z" fill="none" stroke="var(--color-primary-light)" strokeWidth="2" />
              <path d="M0,15 Q25,30 50,15 T100,15 L100,30 L0,30 Z" fill="var(--color-primary)" opacity="0.05" stroke="none" />
            </svg>
          </div>

          <div className="card" style={{ padding: 'var(--space-4)', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', width: 36, height: 36 }}>
                <Check size={18} />
              </div>
              <span className="text-xs font-medium text-secondary">Completed Today</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>{completedTodayCount}</div>
            <div className="text-xs text-muted mb-4">Great job today</div>
            <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 30 }} viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,15 Q25,0 50,15 T100,15 L100,30 L0,30 Z" fill="none" stroke="var(--color-success-light)" strokeWidth="2" />
              <path d="M0,15 Q25,0 50,15 T100,15 L100,30 L0,30 Z" fill="var(--color-success)" opacity="0.05" stroke="none" />
            </svg>
          </div>

          <div className="card" style={{ padding: 'var(--space-4)', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)', width: 36, height: 36 }}>
                <Flame size={18} />
              </div>
              <span className="text-xs font-medium text-secondary">Best Streak</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>{bestOverallStreak} <span className="text-sm font-normal">days</span></div>
            <div className="text-xs text-muted mb-4">Your longest run</div>
            <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 30 }} viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,15 Q25,30 50,15 T100,15 L100,30 L0,30 Z" fill="none" stroke="var(--color-warning-light)" strokeWidth="2" />
              <path d="M0,15 Q25,30 50,15 T100,15 L100,30 L0,30 Z" fill="var(--color-warning)" opacity="0.05" stroke="none" />
            </svg>
          </div>

          <div className="card" style={{ padding: 'var(--space-4)', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="stat-card-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)', width: 36, height: 36 }}>
                <TrendingUp size={18} />
              </div>
              <span className="text-xs font-medium text-secondary">Today's Rate</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-info)' }}>{completionRate}%</div>
            <div className="text-xs text-muted mb-4">Almost there!</div>
            <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 30 }} viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,15 Q25,0 50,15 T100,15 L100,30 L0,30 Z" fill="none" stroke="var(--color-info-light)" strokeWidth="2" />
              <path d="M0,15 Q25,0 50,15 T100,15 L100,30 L0,30 Z" fill="var(--color-info)" opacity="0.05" stroke="none" />
            </svg>
          </div>
        </div>

        <div className="page-layout-split mb-6">
          {/* Main List */}
          <div>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <div className="tabs" style={{ background: 'transparent', padding: 0 }}>
                {([['all', 'All Habits'], ['active', 'Active'], ['completed', 'Completed'], ['paused', 'Paused']] as const).map(([key, label]) => (
                  <button key={key} className={`tab ${filter === key ? 'tab-active' : ''}`} style={{ background: filter === key ? 'var(--color-primary-light)' : 'transparent', color: filter === key ? 'var(--color-primary)' : 'var(--text-secondary)' }} onClick={() => setFilter(key)}>
                    {label}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                <Plus size={16} /> Add Habit
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {habits.map((habit) => {
                const isCompleted = habitCompletions.some(c => c.habit_id === habit.id && c.completed_date === todayStr);
                const currentStreak = calculateStreak(habit.id);
                
                return (
                  <div key={habit.id} className="habit-item-row animate-fadeInUp" style={{ borderLeft: `4px solid ${habit.color}`, flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div className="flex items-center gap-4">
                      <div className="stat-card-icon" style={{ background: `${habit.color}18`, color: habit.color, width: 40, height: 40 }}>
                        {getIcon(habit.icon, 20)}
                      </div>
                      <div>
                        <div className="font-bold text-base" style={{ textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.6 : 1 }}>{habit.title}</div>
                        <div className="text-xs text-secondary mt-1 flex items-center gap-2">
                          <span className="badge" style={{ background: 'var(--bg-secondary)', fontSize: '10px' }}>{habit.frequency} • morning</span>
                          <span className="flex items-center gap-1 text-warning font-medium"><Flame size={12} /> {currentStreak}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`btn ${isCompleted ? 'btn-success' : 'btn-secondary'}`}
                        style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}
                      >
                        {isCompleted ? <><Check size={16} /> Done</> : 'Complete'}
                      </button>
                      <button className="btn btn-icon btn-ghost text-muted" onClick={() => handleDelete(habit.id)}>
                        <Icons.Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex flex-col gap-4">
            
            <div className="card animate-fadeInUp stagger-2" style={{ border: '1px solid var(--border-color)', boxShadow: 'none' }}>
              <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <h3 className="font-bold text-sm">Current Streak</h3>
                <Flame size={16} color="var(--color-warning)" />
              </div>
              <div className="flex flex-col items-center justify-center mb-6">
                <ProgressRing progress={weekProgressPct} size={110} strokeWidth={10} color="var(--color-warning)">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold">{bestOverallStreak}</span>
                    <span className="text-xs font-bold text-muted">Days</span>
                  </div>
                </ProgressRing>
              </div>

              <h4 className="font-bold text-sm mb-3">This Week</h4>
              <div className="flex justify-between items-center mb-4">
                {weekData.map((dayInfo, i) => {
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <span className="text-[10px] text-muted">{dayInfo.dayName}</span>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: dayInfo.isDone ? 'var(--color-success)' : dayInfo.isToday ? 'var(--bg-secondary)' : 'transparent',
                        border: dayInfo.isToday ? '1px dashed var(--color-primary)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                      }}>
                        {dayInfo.isDone && <Check size={12} />}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-secondary font-medium">{completedDaysThisWeek}/7 days completed</span>
                <span className="text-primary font-bold">{weekProgressPct}%</span>
              </div>
              <div className="progress" style={{ height: 6, background: 'var(--bg-secondary)' }}>
                <div className="progress-bar" style={{ width: `${weekProgressPct}%`, background: 'var(--color-primary)' }} />
              </div>
            </div>

          </div>
        </div>

      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Habit"
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveHabit}>Create Habit</button></>}>
        <div className="input-group">
          <label className="input-label">Habit Title</label>
          <input className="input" placeholder="e.g., Drink Water" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="grid grid-2 gap-3">
          <div className="input-group">
            <label className="input-label">Category</label>
            <select className="input select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as HabitCategory })}>
              {Object.entries(HABIT_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Frequency</label>
            <select className="input select" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as HabitFrequency })}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}
