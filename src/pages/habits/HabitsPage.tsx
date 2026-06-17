// ============================================================
// நினைவு (Ninaivu) — Habits Page
// ============================================================

import { useState, useMemo } from 'react';
import {
  Activity, Plus, Flame, Check, X, Target, BarChart2,
  Calendar as CalendarIcon, Undo, LayoutDashboard
} from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { HABIT_CATEGORIES } from '../../utils/constants';
import type { HabitCategory, HabitFrequency } from '../../types';

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HabitsPage() {
  const { habits, habitCompletions, goals, addItem, deleteItem } = useData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'heatmap' | 'analytics'>('dashboard');
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
  const activeHabits = habits.filter(h => true); // In future we could add status to habit
  const todaysCompletions = habitCompletions.filter(c => c.completed_date === todayStr);
  const completedTodayCount = todaysCompletions.length;
  
  const completionRate = activeHabits.length > 0
    ? Math.round((completedTodayCount / activeHabits.length) * 100)
    : 0;

  // Streak logic (Simplified daily streak)
  const calculateStreak = (habitId: string) => {
    const dates = habitCompletions
      .filter(c => c.habit_id === habitId)
      .map(c => c.completed_date)
      .sort((a, b) => b.localeCompare(a));
    
    if (dates.length === 0) return { current: 0, best: 0, total: 0 };
    
    let current = 0;
    let best = 0;
    let tempStreak = 0;
    let lastDate = new Date(); // Start checking from today
    
    // Normalize to midnight local time for safe day math
    lastDate.setHours(0, 0, 0, 0);

    const dateSet = new Set(dates);
    
    // Check current streak starting from today or yesterday
    let checkDate = new Date(lastDate);
    if (!dateSet.has(getLocalDateString(checkDate))) {
      checkDate.setDate(checkDate.getDate() - 1); // Check yesterday
      if (!dateSet.has(getLocalDateString(checkDate))) {
        current = 0;
      } else {
        while(dateSet.has(getLocalDateString(checkDate))) {
          current++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    } else {
      while(dateSet.has(getLocalDateString(checkDate))) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Calculate best streak globally
    let sortedDatesAsc = [...dates].reverse();
    if (sortedDatesAsc.length > 0) {
      tempStreak = 1;
      best = 1;
      for (let i = 1; i < sortedDatesAsc.length; i++) {
        const prev = new Date(sortedDatesAsc[i - 1]);
        const curr = new Date(sortedDatesAsc[i]);
        const diffTime = Math.abs(curr.getTime() - prev.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > best) best = tempStreak;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
    }

    return { current, best, total: dates.length };
  };

  const bestOverallStreak = habits.reduce((max, h) => {
    const s = calculateStreak(h.id);
    return s.current > max ? s.current : max;
  }, 0);

  // Handlers
  const handleSaveHabit = async () => {
    if (!form.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
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

  // Heatmap generation
  const generateHeatmap = () => {
    const days = 90; // Last 90 days
    const map = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = getLocalDateString(d);
      const count = habitCompletions.filter(c => c.completed_date === ds).length;
      map.push({ date: ds, count });
    }
    return map;
  };

  const heatmapData = useMemo(() => generateHeatmap(), [habitCompletions]);

  return (
    <>
      <TopBar title="Habits" subtitle="Build better routines" />

      <div className="page">
        {/* Top Stats */}
        <div className="grid grid-4 animate-fadeInUp" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <Activity size={22} />
              </div>
              <span className="stat-card-value">{activeHabits.length}</span>
              <span className="stat-card-label">Active Habits</span>
            </div>
          </div>
          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                <Check size={22} />
              </div>
              <span className="stat-card-value">{completedTodayCount}</span>
              <span className="stat-card-label">Completed Today</span>
            </div>
          </div>
          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                <Flame size={22} />
              </div>
              <span className="stat-card-value">{bestOverallStreak}</span>
              <span className="stat-card-label">Best Active Streak</span>
            </div>
          </div>
          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
                <Target size={22} />
              </div>
              <span className="stat-card-value">{completionRate}%</span>
              <span className="stat-card-label">Today's Rate</span>
            </div>
          </div>
        </div>

        {/* Tabs & Add Button */}
        <div className="flex items-center justify-between mb-6 animate-fadeInUp stagger-1">
          <div className="tabs">
            <button className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button className={`tab ${activeTab === 'heatmap' ? 'active' : ''}`} onClick={() => setActiveTab('heatmap')}>
              <CalendarIcon size={16} /> Calendar
            </button>
            <button className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
              <BarChart2 size={16} /> Analytics
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add Habit
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-2 animate-fadeInUp stagger-2 gap-4">
            {activeHabits.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-8)' }}>
                <Activity size={32} className="text-muted" style={{ margin: '0 auto var(--space-3)' }} />
                <h3 className="text-lg font-medium mb-2">No habits yet</h3>
                <p className="text-secondary mb-4">Start tracking your daily routines to build better habits.</p>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>Create your first habit</button>
              </div>
            ) : (
              activeHabits.map((habit) => {
                const isCompleted = todaysCompletions.some(c => c.habit_id === habit.id);
                const stats = calculateStreak(habit.id);
                
                return (
                  <div key={habit.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: habit.color }} />
                    <div className="flex justify-between items-start" style={{ paddingLeft: 'var(--space-2)' }}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span style={{ color: habit.color, fontSize: '1.2rem' }}>•</span>
                          <h3 className="font-semibold text-lg">{habit.title}</h3>
                          <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{habit.frequency}</span>
                        </div>
                        {habit.description && <p className="text-sm text-secondary mb-3">{habit.description}</p>}
                        
                        <div className="flex items-center gap-4 text-sm text-secondary mt-2">
                          <div className="flex items-center gap-1" title="Current Streak">
                            <Flame size={14} style={{ color: stats.current > 0 ? 'var(--color-warning)' : 'inherit' }} />
                            {stats.current} days
                          </div>
                          <div className="flex items-center gap-1" title="Best Streak">
                            <Target size={14} />
                            Best: {stats.best}
                          </div>
                          <div className="flex items-center gap-1" title="Total Completions">
                            <Check size={14} />
                            Total: {stats.total}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <button 
                          className={`btn ${isCompleted ? 'btn-ghost' : 'btn-primary'} btn-icon`}
                          style={{ 
                            borderRadius: '50%', width: 48, height: 48,
                            background: isCompleted ? 'var(--bg-secondary)' : habit.color,
                            color: isCompleted ? 'var(--text-primary)' : '#fff',
                            border: 'none'
                          }}
                          onClick={() => toggleHabit(habit.id)}
                          title={isCompleted ? "Undo completion" : "Mark complete"}
                        >
                          {isCompleted ? <Undo size={20} /> : <Check size={24} />}
                        </button>
                        <button className="btn btn-ghost btn-sm text-xs" onClick={() => handleDelete(habit.id)} style={{ padding: '4px 8px', height: 'auto', marginTop: 'auto' }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === 'heatmap' && (
          <div className="card animate-fadeInUp stagger-2">
            <h3 className="font-semibold mb-4">Last 90 Days Overview</h3>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: '100%' }}>
              {heatmapData.map((d, i) => {
                let bg = 'var(--bg-secondary)';
                if (d.count === 1) bg = 'rgba(16, 185, 129, 0.4)';
                if (d.count === 2) bg = 'rgba(16, 185, 129, 0.6)';
                if (d.count >= 3) bg = 'rgba(16, 185, 129, 1)';
                
                return (
                  <div 
                    key={i} 
                    title={`${d.date}: ${d.count} completions`}
                    style={{
                      width: 14, height: 14, borderRadius: 2, background: bg, cursor: 'help'
                    }}
                  />
                )
              })}
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-secondary justify-end">
              <span>Less</span>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--bg-secondary)' }} />
              <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(16, 185, 129, 0.4)' }} />
              <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(16, 185, 129, 0.6)' }} />
              <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(16, 185, 129, 1)' }} />
              <span>More</span>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-2 gap-4 animate-fadeInUp stagger-2">
            <div className="card">
              <h3 className="font-semibold mb-4">Consistency Score</h3>
              <div className="flex items-center justify-center" style={{ height: 150 }}>
                <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: `conic-gradient(var(--color-primary) ${completionRate}%, var(--bg-secondary) 0)` }}>
                  <div style={{ position: 'absolute', width: 100, height: 100, background: 'var(--bg-card)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <span className="text-2xl font-bold">{completionRate}%</span>
                    <span className="text-xs text-secondary">Today</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-4">Habit Overview</h3>
              <ul className="space-y-3">
                {activeHabits.map(h => {
                  const s = calculateStreak(h.id);
                  return (
                    <li key={h.id} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: h.color }} />
                        {h.title}
                      </span>
                      <span className="text-secondary font-medium">{s.total} total</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Habit"
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveHabit}>Save</button></>}>
        <div className="input-group">
          <label className="input-label">Habit Name</label>
          <input className="input" placeholder="e.g. Read 10 Pages" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
        </div>
        <div className="input-group">
          <label className="input-label">Description (Optional)</label>
          <input className="input" placeholder="Why are you building this habit?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-2 gap-3">
          <div className="input-group">
            <label className="input-label">Category</label>
            <select className="input select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as HabitCategory })}>
              {Object.entries(HABIT_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Frequency</label>
            <select className="input select" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as HabitFrequency })}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        {goals.length > 0 && (
          <div className="input-group">
            <label className="input-label">Link to Goal (Optional)</label>
            <select className="input select" value={form.goal_id} onChange={(e) => setForm({ ...form, goal_id: e.target.value })}>
              <option value="">-- None --</option>
              {goals.filter(g => g.status === 'active').map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
            <p className="text-xs text-muted mt-1">Completing this habit will boost the goal's progress.</p>
          </div>
        )}
      </Modal>
    </>
  );
}
