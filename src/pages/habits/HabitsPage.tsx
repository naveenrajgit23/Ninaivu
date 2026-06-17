// ============================================================
// நினைவு (Ninaivu) — Habits Page
// ============================================================

import { useState, useMemo } from 'react';
import {
  Plus, Flame, Target, Trash2, Edit3, Check, Calendar,
  ChevronLeft, ChevronRight, BarChart2, ListTodo, Search,
  Award, Info, RefreshCw, Star, Heart, BookOpen, Dumbbell,
  Terminal, Sparkles, AlertCircle
} from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/helpers';
import {
  calculateHabitStats,
  getLocalDateString,
  getStartOfWeekDateString,
  getStartOfMonthDateString,
  getMonthlyHeatmapData
} from '../../utils/habitHelpers';
import type { Habit, HabitFrequency, HabitCompletion } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';

const HABIT_ICONS = {
  Flame: Flame,
  BookOpen: BookOpen,
  Dumbbell: Dumbbell,
  Heart: Heart,
  Terminal: Terminal,
  Sparkles: Sparkles,
  Target: Target,
  Star: Star
};

const HABIT_COLORS = [
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Blue', value: '#3B82F6' }
];

export default function HabitsPage() {
  const { habits, habitCompletions, goals, addItem, updateItem, deleteItem } = useData();
  const { showToast } = useToast();

  // Navigation tabs: 'tracker' | 'analytics'
  const [activeTab, setActiveTab] = useState<'tracker' | 'analytics'>('tracker');

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<HabitFrequency | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Health',
    icon: 'Flame',
    color: '#6366F1',
    frequency: 'daily' as HabitFrequency,
    target_count: 1,
    start_date: getLocalDateString(new Date()),
    reminder_time: '',
    goal_id: ''
  });

  // Heatmap Calendar state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(getLocalDateString(new Date()));

  // 1. Group habits categories
  const categories = useMemo(() => {
    const cats = new Set(habits.map((h) => h.category));
    return ['all', ...Array.from(cats)];
  }, [habits]);

  // 2. Filter habits
  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        habit.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFreq = frequencyFilter === 'all' || habit.frequency === frequencyFilter;
      const matchesCat = categoryFilter === 'all' || habit.category === categoryFilter;
      return matchesSearch && matchesFreq && matchesCat;
    });
  }, [habits, searchQuery, frequencyFilter, categoryFilter]);

  // 3. Stats calculations
  const statsSummary = useMemo(() => {
    if (habits.length === 0) return { active: 0, completedToday: 0, bestStreak: 0, avgConsistency: 0 };
    
    let completedTodayCount = 0;
    let bestStreak = 0;
    let totalConsistency = 0;

    habits.forEach((h) => {
      const stats = calculateHabitStats(h, habitCompletions);
      if (stats.isCompleted) completedTodayCount++;
      if (stats.currentStreak > bestStreak) bestStreak = stats.currentStreak;
      totalConsistency += stats.consistencyScore;
    });

    return {
      active: habits.length,
      completedToday: completedTodayCount,
      bestStreak,
      avgConsistency: Math.round(totalConsistency / habits.length)
    };
  }, [habits, habitCompletions]);

  // 4. Progress Ring values
  const ringPercentage = habits.length > 0 ? Math.round((statsSummary.completedToday / habits.length) * 100) : 0;
  const strokeDashoffset = 120 - (120 * ringPercentage) / 100;

  // 5. Heatmap calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday, 1 = Monday...
  
  // Adjusted index so Monday is 0, Sunday is 6
  const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthHeatmapData = useMemo(() => {
    return getMonthlyHeatmapData(habitCompletions, currentYear, currentMonth);
  }, [habitCompletions, currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const selectedDayCompletions = useMemo(() => {
    if (!selectedDayStr) return [];
    return habitCompletions.filter((c) => {
      const d = getLocalDateString(new Date(c.completed_at));
      return d === selectedDayStr;
    }).map((c) => {
      const habit = habits.find((h) => h.id === c.habit_id);
      return {
        ...c,
        habitName: habit ? habit.name : 'Unknown Habit',
        color: habit ? habit.color : '#64748B'
      };
    });
  }, [selectedDayStr, habitCompletions, habits]);

  // 6. CRUD Operations Handlers
  const handleSave = async () => {
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      reminder_time: form.reminder_time || null,
      goal_id: form.goal_id || null
    };

    if (editId) {
      await updateItem('habits', editId, payload);
      showToast('Habit updated!', 'success');
    } else {
      await addItem('habits', payload);
      showToast('Habit created!', 'success');
    }
    resetForm();
  };

  const startEdit = (habit: Habit) => {
    setForm({
      name: habit.name,
      description: habit.description,
      category: habit.category,
      icon: habit.icon,
      color: habit.color,
      frequency: habit.frequency,
      target_count: habit.target_count,
      start_date: habit.start_date.split('T')[0],
      reminder_time: habit.reminder_time || '',
      goal_id: habit.goal_id || ''
    });
    setEditId(habit.id);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this habit and all its completions?')) {
      await deleteItem('habits', id);
      showToast('Habit deleted', 'info');
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    const completions = habitCompletions.filter((c) => c.habit_id === habitId);
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const stats = calculateHabitStats(habit, habitCompletions);

    if (stats.isCompleted) {
      // Undo completions in active period
      let completionsToDelete: HabitCompletion[] = [];
      const todayStr = getLocalDateString(new Date());

      if (habit.frequency === 'daily') {
        completionsToDelete = completions.filter((c) => getLocalDateString(new Date(c.completed_at)) === todayStr);
      } else if (habit.frequency === 'weekly') {
        const currentWeekStr = getStartOfWeekDateString(new Date());
        completionsToDelete = completions.filter((c) => getStartOfWeekDateString(new Date(c.completed_at)) === currentWeekStr);
      } else {
        const currentMonthStr = getStartOfMonthDateString(new Date());
        completionsToDelete = completions.filter((c) => getStartOfMonthDateString(new Date(c.completed_at)) === currentMonthStr);
      }

      if (completionsToDelete.length > 0) {
        const latest = completionsToDelete.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];
        await deleteItem('habitCompletions', latest.id);
        showToast('Habit progress undone!', 'info');
      }
    } else {
      // Add completion
      await addItem('habitCompletions', {
        habit_id: habitId,
        completed_at: new Date().toISOString()
      });
      showToast('Habit progress updated!', 'success');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      category: 'Health',
      icon: 'Flame',
      color: '#6366F1',
      frequency: 'daily' as HabitFrequency,
      target_count: 1,
      start_date: getLocalDateString(new Date()),
      reminder_time: '',
      goal_id: ''
    });
    setEditId(null);
    setShowAddModal(false);
  };

  // 7. Analytics chart generation
  const weeklyAnalyticsData = useMemo(() => {
    // Generate data for last 7 days
    const daysData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      
      const compCount = habitCompletions.filter((c) => getLocalDateString(new Date(c.completed_at)) === dateStr).length;
      
      daysData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        Completions: compCount
      });
    }
    return daysData;
  }, [habitCompletions]);

  const habitsConsistencyData = useMemo(() => {
    return habits.map((h) => {
      const stats = calculateHabitStats(h, habitCompletions);
      return {
        name: h.name.substring(0, 15) + (h.name.length > 15 ? '...' : ''),
        Consistency: stats.consistencyScore
      };
    }).sort((a, b) => b.Consistency - a.Consistency);
  }, [habits, habitCompletions]);

  // Derived Analytics stats
  const bestPerformingHabit = useMemo(() => {
    if (habits.length === 0) return null;
    let bestHabit: Habit | null = null;
    let maxStreak = -1;

    habits.forEach((h) => {
      const stats = calculateHabitStats(h, habitCompletions);
      if (stats.currentStreak > maxStreak) {
        maxStreak = stats.currentStreak;
        bestHabit = h;
      }
    });

    return bestHabit ? { habit: bestHabit as Habit, streak: maxStreak } : null;
  }, [habits, habitCompletions]);

  const consistencyLeader = useMemo(() => {
    if (habits.length === 0) return null;
    let bestHabit: Habit | null = null;
    let maxConsistency = -1;

    habits.forEach((h) => {
      const stats = calculateHabitStats(h, habitCompletions);
      if (stats.consistencyScore > maxConsistency) {
        maxConsistency = stats.consistencyScore;
        bestHabit = h;
      }
    });

    return bestHabit ? { habit: bestHabit as Habit, consistency: maxConsistency } : null;
  }, [habits, habitCompletions]);

  return (
    <>
      <TopBar title="Habits" subtitle={`${statsSummary.active} active habits`} />

      <div className="page">
        {/* Navigation Tabs */}
        <div className="tabs mb-6">
          <button className={`tab ${activeTab === 'tracker' ? 'tab-active' : ''}`} onClick={() => setActiveTab('tracker')}>
            <ListTodo size={16} /> Tracker
          </button>
          <button className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart2 size={16} /> Analytics
          </button>
        </div>

        {activeTab === 'tracker' ? (
          <div className="grid grid-3 gap-6" style={{ alignItems: 'flex-start' }}>
            
            {/* Left: Habit Checklist and Filters */}
            <div className="grid-col-2 flex flex-col gap-6">
              
              {/* Stats Overview */}
              <section className="grid grid-2 gap-4">
                <div className="card card-gradient flex items-center justify-between" style={{ padding: 'var(--space-4)' }}>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
                      <Flame size={20} />
                    </div>
                    <span className="stat-card-value">{statsSummary.active}</span>
                    <span className="stat-card-label">Active Habits</span>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', marginBottom: 'var(--space-2)' }}>
                      <Check size={20} />
                    </div>
                    <span className="stat-card-value">{statsSummary.completedToday}</span>
                    <span className="stat-card-label">Completed Today</span>
                  </div>
                </div>

                <div className="card card-gradient flex items-center justify-between" style={{ padding: 'var(--space-4)' }}>
                  <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)', marginBottom: 'var(--space-2)' }}>
                      <Award size={20} />
                    </div>
                    <span className="stat-card-value">{statsSummary.bestStreak}</span>
                    <span className="stat-card-label">Best Streak</span>
                  </div>
                  
                  {/* Progress Circle */}
                  <div className="flex flex-col items-center gap-1" style={{ width: '60px' }}>
                    <svg viewBox="0 0 44 44" width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="22" cy="22" r="19" fill="transparent" stroke="var(--border-color)" strokeWidth="3" />
                      <circle cx="22" cy="22" r="19" fill="transparent" stroke="var(--color-success)" strokeWidth="3"
                        strokeDasharray="120" strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.35s' }} />
                    </svg>
                    <span className="text-xs font-semibold">{ringPercentage}% Done</span>
                  </div>
                </div>
              </section>

              {/* Filters */}
              <section className="card" style={{ padding: 'var(--space-4)' }}>
                <div className="flex gap-3 flex-wrap">
                  {/* Search */}
                  <div className="search-bar flex-1" style={{ minWidth: '180px' }}>
                    <span className="search-icon"><Search size={16} /></span>
                    <input className="input" style={{ paddingLeft: 'var(--space-8)' }} placeholder="Search habits..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  
                  {/* Frequency Filter */}
                  <select className="input select" style={{ width: '130px' }} value={frequencyFilter} onChange={(e) => setFrequencyFilter(e.target.value as any)}>
                    <option value="all">All Freq</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>

                  {/* Category Filter */}
                  <select className="input select" style={{ width: '130px' }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="all">All Category</option>
                    {categories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </section>

              {/* Habits Checklist */}
              <section className="flex flex-col gap-3">
                {filteredHabits.length === 0 ? (
                  <EmptyState
                    icon={<Flame size={32} />}
                    title="No habits found"
                    description="Create a habit to begin tracking your productivity."
                    action={<button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add Habit</button>}
                  />
                ) : (
                  filteredHabits.map((habit) => {
                    const stats = calculateHabitStats(habit, habitCompletions);
                    const IconComponent = HABIT_ICONS[habit.icon as keyof typeof HABIT_ICONS] || Flame;

                    // Get completion count for current period
                    let periodCount = 0;
                    const todayStr = getLocalDateString(new Date());
                    const completions = habitCompletions.filter((c) => c.habit_id === habit.id);
                    if (habit.frequency === 'daily') {
                      periodCount = completions.filter((c) => getLocalDateString(new Date(c.completed_at)) === todayStr).length;
                    } else if (habit.frequency === 'weekly') {
                      const currentWeekStr = getStartOfWeekDateString(new Date());
                      periodCount = completions.filter((c) => getStartOfWeekDateString(new Date(c.completed_at)) === currentWeekStr).length;
                    } else {
                      const currentMonthStr = getStartOfMonthDateString(new Date());
                      periodCount = completions.filter((c) => getStartOfMonthDateString(new Date(c.completed_at)) === currentMonthStr).length;
                    }

                    return (
                      <div key={habit.id} className="card card-interactive animate-fadeInUp" style={{ padding: 'var(--space-4)' }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {/* Complete trigger */}
                            <button
                              onClick={() => handleToggleHabit(habit.id)}
                              style={{
                                width: 24, height: 24, borderRadius: 'var(--radius-sm)',
                                border: `2px solid ${stats.isCompleted ? 'var(--color-success)' : habit.color}`,
                                background: stats.isCompleted ? 'var(--color-success)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                transition: 'all var(--transition-fast)'
                              }}
                            >
                              {stats.isCompleted && <Check size={16} color="white" />}
                            </button>

                            <div>
                              <h3 className="font-semibold text-base" style={{ textDecoration: stats.isCompleted ? 'line-through' : 'none', opacity: stats.isCompleted ? 0.6 : 1 }}>
                                {habit.name}
                              </h3>
                              <span className="text-xs text-muted">
                                Category: {habit.category} • Frequency: {habit.frequency}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button className="btn btn-icon btn-ghost" onClick={() => startEdit(habit)} style={{ padding: 4 }}><Edit3 size={15} /></button>
                            <button className="btn btn-icon btn-ghost" onClick={() => handleDelete(habit.id)} style={{ padding: 4 }}><Trash2 size={15} /></button>
                          </div>
                        </div>

                        {habit.description && <p className="text-sm text-secondary mb-3">{habit.description}</p>}

                        {/* Tracker Progress Bar */}
                        <div className="flex items-center justify-between text-xs text-muted mb-2">
                          <span>Progress this period</span>
                          <span className="font-medium" style={{ color: habit.color }}>
                            {periodCount} / {habit.target_count} ({Math.min(100, Math.round((periodCount / habit.target_count) * 100))}%)
                          </span>
                        </div>
                        <div className="progress mb-3" style={{ height: 6 }}>
                          <div className="progress-bar" style={{ width: `${Math.min(100, (periodCount / habit.target_count) * 100)}%`, background: habit.color }} />
                        </div>

                        {/* Consistency stats */}
                        <div className="grid grid-3 gap-2 text-center" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <div className="text-xs text-muted">Streak</div>
                            <div className="text-sm font-bold flex items-center justify-center gap-0.5" style={{ color: 'var(--color-warning)' }}>
                              <Flame size={14} fill="var(--color-warning)" /> {stats.currentStreak}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted">Longest</div>
                            <div className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                              {stats.longestStreak}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted">Consistency</div>
                            <div className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>
                              {stats.consistencyScore}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>
            </div>

            {/* Right: GitHub Heatmap Calendar */}
            <div className="flex flex-col gap-6">
              
              {/* Heatmap Card */}
              <section className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-md font-bold font-heading">Heatmap Calendar</h2>
                  <div className="flex items-center gap-1">
                    <button className="btn btn-icon btn-ghost" onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
                    <span className="text-sm font-semibold">{monthNames[currentMonth]} {currentYear}</span>
                    <button className="btn btn-icon btn-ghost" onClick={handleNextMonth}><ChevronRight size={16} /></button>
                  </div>
                </div>

                {/* Day Labels */}
                <div className="grid grid-7 text-center text-xs text-muted font-semibold mb-2">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-7 gap-1">
                  {/* Empty offsets */}
                  {Array.from({ length: adjustedFirstDayIndex }).map((_, index) => (
                    <div key={`offset-${index}`} style={{ aspectRatio: '1/1' }} />
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const count = monthHeatmapData[dateStr] || 0;
                    
                    // Determine green shades
                    let bgColor = 'var(--bg-secondary)';
                    let textColor = 'var(--text-primary)';
                    if (count === 1) bgColor = 'rgba(16, 185, 129, 0.15)';
                    else if (count >= 2 && count <= 3) bgColor = 'rgba(16, 185, 129, 0.45)';
                    else if (count >= 4) {
                      bgColor = 'rgba(16, 185, 129, 1.0)';
                      textColor = '#ffffff';
                    }

                    const isSelected = selectedDayStr === dateStr;

                    return (
                      <button
                        key={`day-${day}`}
                        onClick={() => setSelectedDayStr(dateStr)}
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          aspectRatio: '1/1',
                          borderRadius: 'var(--radius-sm)',
                          background: bgColor,
                          color: textColor,
                          border: isSelected ? '2px solid var(--color-primary)' : 'none',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease'
                        }}
                        title={`${dateStr}: ${count} completions`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-1 mt-4 text-xs text-muted">
                  <span>Less</span>
                  <div style={{ width: 12, height: 12, background: 'var(--bg-secondary)', borderRadius: 2 }} />
                  <div style={{ width: 12, height: 12, background: 'rgba(16, 185, 129, 0.15)', borderRadius: 2 }} />
                  <div style={{ width: 12, height: 12, background: 'rgba(16, 185, 129, 0.45)', borderRadius: 2 }} />
                  <div style={{ width: 12, height: 12, background: 'rgba(16, 185, 129, 1.0)', borderRadius: 2 }} />
                  <span>More</span>
                </div>
              </section>

              {/* Day completions summary */}
              {selectedDayStr && (
                <section className="card">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
                    <h3 className="text-sm font-bold">Completions on {formatDate(selectedDayStr)}</h3>
                  </div>

                  {selectedDayCompletions.length === 0 ? (
                    <p className="text-xs text-muted text-center py-4">No completions recorded for this day.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {selectedDayCompletions.map((comp) => (
                        <div key={comp.id} className="flex items-center gap-2 text-xs" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: comp.color }} />
                          <span className="font-semibold flex-1">{comp.habitName}</span>
                          <span className="text-muted">{formatDate(comp.completed_at, { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        ) : (
          /* Analytics Tab */
          <div className="flex flex-col gap-6 animate-fadeInUp">
            
            {/* Top Analytics Cards */}
            <div className="grid grid-3 gap-6">
              
              <div className="card card-gradient flex items-center gap-4">
                <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', width: 44, height: 44 }}>
                  <Award size={22} />
                </div>
                <div>
                  <div className="text-xs text-muted">Best Active Streak</div>
                  {bestPerformingHabit ? (
                    <>
                      <div className="text-md font-bold">{bestPerformingHabit.habit.name}</div>
                      <div className="text-xs text-muted flex items-center gap-0.5 mt-0.5" style={{ color: 'var(--color-warning)' }}>
                        <Flame size={12} fill="var(--color-warning)" /> {bestPerformingHabit.streak} days
                      </div>
                    </>
                  ) : (
                    <div className="text-sm font-bold text-muted">No habits tracked</div>
                  )}
                </div>
              </div>

              <div className="card card-gradient flex items-center gap-4">
                <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', width: 44, height: 44 }}>
                  <CheckSquare size={22} />
                </div>
                <div>
                  <div className="text-xs text-muted">Most Consistent Habit</div>
                  {consistencyLeader ? (
                    <>
                      <div className="text-md font-bold">{consistencyLeader.habit.name}</div>
                      <div className="text-xs text-muted mt-0.5 font-semibold" style={{ color: 'var(--color-success)' }}>
                        {consistencyLeader.consistency}% consistency
                      </div>
                    </>
                  ) : (
                    <div className="text-sm font-bold text-muted">No habits tracked</div>
                  )}
                </div>
              </div>

              <div className="card card-gradient flex items-center gap-4">
                <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)', width: 44, height: 44 }}>
                  <Info size={22} />
                </div>
                <div>
                  <div className="text-xs text-muted">Consistency Average</div>
                  <div className="text-lg font-bold">{statsSummary.avgConsistency}%</div>
                  <div className="text-xs text-muted">Across all active habits</div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-2 gap-6">
              
              {/* Daily Completions Trend */}
              <div className="card">
                <h3 className="text-md font-bold font-heading mb-4">Completions in Last 7 Days</h3>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={weeklyAnalyticsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                      <Line type="monotone" dataKey="Completions" stroke="var(--color-success)" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Consistency Leaderboard */}
              <div className="card">
                <h3 className="text-md font-bold font-heading mb-4">Habit Consistency Scores (%)</h3>
                {habits.length === 0 ? (
                  <p className="text-xs text-muted text-center py-20">Create habits to view consistency ranking.</p>
                ) : (
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={habitsConsistencyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                        <Bar dataKey="Consistency" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Add button */}
        <button className="fab" onClick={() => setShowAddModal(true)} id="fab-add-habit">
          <Plus size={24} />
        </button>
      </div>

      {/* CRUD Add/Edit Habit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={resetForm}
        title={editId ? 'Edit Habit' : 'New Habit'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Update' : 'Create'}</button>
          </>
        }
      >
        <div className="input-group">
          <label className="input-label">Habit Name</label>
          <input className="input" placeholder="e.g. Read 10 Pages, Exercise..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus id="habit-name" maxLength={40} />
        </div>
        
        <div className="input-group">
          <label className="input-label">Description (Optional)</label>
          <textarea className="input textarea" placeholder="e.g. Keep a book on the nightstand..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} id="habit-desc" maxLength={150} />
        </div>

        <div className="grid grid-2 gap-3">
          <div className="input-group">
            <label className="input-label">Category</label>
            <input className="input" placeholder="e.g. Health, Work, Study..." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} id="habit-category" maxLength={20} />
          </div>

          <div className="input-group">
            <label className="input-label">Frequency</label>
            <select className="input select" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as HabitFrequency })} id="habit-frequency">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div className="grid grid-2 gap-3">
          <div className="input-group">
            <label className="input-label">Target Count (per period)</label>
            <input className="input" type="number" min={1} max={100} value={form.target_count} onChange={(e) => setForm({ ...form, target_count: parseInt(e.target.value) || 1 })} id="habit-target-count" />
          </div>

          <div className="input-group">
            <label className="input-label">Start Date</label>
            <input className="input" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} id="habit-start-date" />
          </div>
        </div>

        <div className="grid grid-2 gap-3">
          <div className="input-group">
            <label className="input-label">Reminder Time (Optional)</label>
            <input className="input" type="time" value={form.reminder_time} onChange={(e) => setForm({ ...form, reminder_time: e.target.value })} id="habit-reminder" />
          </div>

          {goals.length > 0 && (
            <div className="input-group">
              <label className="input-label">Link to Goal (Optional)</label>
              <select className="input select" value={form.goal_id} onChange={(e) => setForm({ ...form, goal_id: e.target.value })} id="habit-goal">
                <option value="">None</option>
                {goals.filter((g) => g.status === 'active').map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Color picker */}
        <div className="input-group">
          <label className="input-label">Color Theme</label>
          <div className="flex gap-2">
            {HABIT_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setForm({ ...form, color: c.value })}
                type="button"
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: c.value,
                  border: form.color === c.value ? '3px solid var(--text-primary)' : 'none',
                  cursor: 'pointer',
                  transform: form.color === c.value ? 'scale(1.1)' : 'none',
                  transition: 'transform var(--transition-fast)'
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Icon picker */}
        <div className="input-group">
          <label className="input-label">Select Icon</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(HABIT_ICONS).map(([name, IconComponent]) => (
              <button
                key={name}
                onClick={() => setForm({ ...form, icon: name })}
                type="button"
                className={`btn btn-icon btn-ghost ${form.icon === name ? 'nav-item-active' : ''}`}
                style={{
                  border: form.icon === name ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px'
                }}
              >
                <IconComponent size={18} style={{ color: form.color }} />
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}

// Simple fallback if checksquare or listtodo aren't imported or are overlapping
function CheckSquare(props: { size: number }) {
  return <AlertCircle {...props} />;
}
