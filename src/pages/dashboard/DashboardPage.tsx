// ============================================================
// நினைவு (Ninaivu) — Dashboard Page v2
// Hero banner, quick actions, rich sections
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CheckSquare, Clock, GraduationCap, AlertCircle,
  Plus, Wallet, StickyNote, Lightbulb, TrendingUp,
  ArrowRight, Calendar, Activity, CheckCircle2, Circle,
  Zap, Target, BookOpen, Flame
} from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import {
  getGreeting, formatDate, formatCurrency, isToday, isWithinDays
} from '../../utils/helpers';

const GREETING_EMOJIS: Record<string, string> = {
  'Good morning': '🌅',
  'Good afternoon': '☀️',
  'Good evening': '🌙',
  'Good night': '🌙',
};

function getGreetingEmoji(greeting: string): string {
  for (const [key, emoji] of Object.entries(GREETING_EMOJIS)) {
    if (greeting.startsWith(key)) return emoji;
  }
  return '👋';
}

const todayLabel = () => {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, exams, expenses, goals, habits, habitCompletions, addItem } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIdeaModal, setShowIdeaModal] = useState(false);

  const [quickTask, setQuickTask] = useState('');
  const [quickExpense, setQuickExpense] = useState({ amount: '', category: 'food', description: '' });
  const [quickNote, setQuickNote] = useState({ title: '', content: '' });
  const [quickIdea, setQuickIdea] = useState({ title: '', category: 'app' });

  const today = todayStr();
  const greeting = getGreeting();

  // Derived data
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const todayTasks = tasks.filter((t) => t.due_date && isToday(t.due_date) && t.status !== 'completed');
  const upcomingExams = exams.filter((e) => isWithinDays(e.exam_date, 30));
  const activeGoals = goals.filter((g) => g.status === 'active');

  const thisMonthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.expense_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const activeHabits = habits || [];
  const todaysCompletions = (habitCompletions || []).filter(c => c.completed_date === today);
  const completedHabitsCount = todaysCompletions.length;
  const habitProgress = activeHabits.length > 0
    ? Math.round((completedHabitsCount / activeHabits.length) * 100)
    : 0;

  // Quick action handlers
  const handleAddQuickTask = async () => {
    if (!quickTask.trim()) return;
    await addItem('tasks', {
      title: quickTask, description: '', type: 'general', priority: 'medium',
      status: 'pending', due_date: new Date().toISOString(), reminder_at: null, completed_at: null, goal_id: null,
    });
    setQuickTask(''); setShowTaskModal(false);
    showToast('Task added!', 'success');
  };

  const handleAddQuickExpense = async () => {
    if (!quickExpense.amount) return;
    await addItem('expenses', {
      amount: parseFloat(quickExpense.amount),
      category: quickExpense.category as 'food' | 'travel' | 'education' | 'shopping' | 'other',
      description: quickExpense.description,
      expense_date: new Date().toISOString().split('T')[0],
    });
    setQuickExpense({ amount: '', category: 'food', description: '' });
    setShowExpenseModal(false);
    showToast('Expense added!', 'success');
  };

  const handleAddQuickNote = async () => {
    if (!quickNote.title.trim()) return;
    await addItem('notes', { title: quickNote.title, content: quickNote.content, subject_id: null, type: 'note', tags: [] });
    setQuickNote({ title: '', content: '' }); setShowNoteModal(false);
    showToast('Note saved!', 'success');
  };

  const handleAddQuickIdea = async () => {
    if (!quickIdea.title.trim()) return;
    await addItem('ideas', {
      title: quickIdea.title, description: '',
      category: quickIdea.category as 'app' | 'business' | 'project' | 'research',
      tags: [], is_favorite: false,
    });
    setQuickIdea({ title: '', category: 'app' }); setShowIdeaModal(false);
    showToast('Idea saved!', 'success');
  };

  return (
    <>
      <TopBar title={greeting} subtitle={formatDate(new Date().toISOString())} />

      <div className="page">

        {/* ── Hero Banner ── */}
        <div className="hero-banner animate-fadeInUp">
          <div className="hero-date-pill">
            <Calendar size={12} />
            {todayLabel()}
          </div>
          <h2 className="hero-greeting">
            {getGreetingEmoji(greeting)} {user?.full_name ? `Hey, ${user.full_name.split(' ')[0]}!` : 'Welcome back!'}
          </h2>
          <p className="hero-subtext">
            {pendingTasks.length > 0
              ? `You have ${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''}. Let's get things done!`
              : 'All caught up! Have a great day. ✨'}
          </p>
          <div className="hero-stats-row" style={{ marginTop: 'var(--space-5)' }}>
            <div className="hero-stat-chip">
              <CheckSquare size={14} />
              <span><strong>{pendingTasks.length}</strong> tasks</span>
            </div>
            {activeHabits.length > 0 && (
              <div className="hero-stat-chip">
                <Flame size={14} />
                <span><strong>{completedHabitsCount}/{activeHabits.length}</strong> habits</span>
              </div>
            )}
            <div className="hero-stat-chip">
              <TrendingUp size={14} />
              <span><strong>{activeGoals.length}</strong> goals</span>
            </div>
            <div className="hero-stat-chip">
              <Wallet size={14} />
              <span><strong>{formatCurrency(thisMonthExpenses)}</strong> spent</span>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="animate-fadeInUp stagger-1" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="section-header">
            <span className="section-title">
              <Zap size={16} style={{ color: 'var(--color-warning)' }} />
              Quick Add
            </span>
          </div>
          <div className="quick-actions-row">
            <button className="quick-action-btn" onClick={() => setShowTaskModal(true)} id="qa-add-task">
              <div className="quick-action-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
                <CheckSquare size={20} />
              </div>
              Task
            </button>
            <button className="quick-action-btn" onClick={() => setShowExpenseModal(true)} id="qa-add-expense">
              <div className="quick-action-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                <Wallet size={20} />
              </div>
              Expense
            </button>
            <button className="quick-action-btn" onClick={() => setShowNoteModal(true)} id="qa-add-note">
              <div className="quick-action-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                <StickyNote size={20} />
              </div>
              Note
            </button>
            <button className="quick-action-btn" onClick={() => setShowIdeaModal(true)} id="qa-add-idea">
              <div className="quick-action-icon" style={{ background: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}>
                <Lightbulb size={20} />
              </div>
              Idea
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/study')}>
              <div className="quick-action-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <BookOpen size={20} />
              </div>
              Study
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/goals')}>
              <div className="quick-action-icon" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
                <Target size={20} />
              </div>
              Goal
            </button>
          </div>
        </div>

        {/* ── Today's Habits ── */}
        {activeHabits.length > 0 && (
          <section className="animate-fadeInUp stagger-2" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="section-header">
              <span className="section-title">
                <Activity size={16} style={{ color: 'var(--color-primary)' }} />
                Today's Habits
              </span>
              <button className="section-link" onClick={() => navigate('/habits')}>
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="card">
              {/* Progress Bar */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-secondary">
                  {completedHabitsCount} of {activeHabits.length} completed
                </span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                  {habitProgress}%
                </span>
              </div>
              <div className="progress mb-4">
                <div className="progress-bar" style={{ width: `${habitProgress}%` }} />
              </div>
              <div className="grid sm-grid-2" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)' }}>
                {activeHabits.slice(0, 4).map(habit => {
                  const isCompleted = todaysCompletions.some(c => c.habit_id === habit.id);
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center gap-2"
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        background: isCompleted ? 'var(--color-success-light)' : 'var(--bg-secondary)',
                        border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.2)' : 'var(--border-subtle)'}`,
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {isCompleted
                        ? <CheckCircle2 size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                        : <Circle size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      }
                      <span className={`text-xs truncate ${isCompleted ? 'line-through text-muted' : ''}`}>
                        {habit.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Today's Tasks ── */}
        <section className="animate-fadeInUp stagger-3" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="section-header">
            <span className="section-title">
              <CheckSquare size={16} style={{ color: 'var(--color-info)' }} />
              Today's Tasks
            </span>
            <button className="section-link" onClick={() => navigate('/tasks')}>
              View all <ArrowRight size={14} />
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
              <Clock size={28} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-3)' }} />
              <p className="text-sm text-muted">No tasks due today. You're all clear! 🎉</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todayTasks.slice(0, 5).map((task) => {
                const priorityColors: Record<string, string> = {
                  high: 'var(--color-error)',
                  medium: 'var(--color-warning)',
                  low: 'var(--color-success)',
                };
                const priorityBg: Record<string, string> = {
                  high: 'var(--color-error-light)',
                  medium: 'var(--color-warning-light)',
                  low: 'var(--color-success-light)',
                };
                return (
                  <div
                    key={task.id}
                    className="card card-interactive"
                    style={{ padding: 'var(--space-3) var(--space-4)', borderLeft: `3px solid ${priorityColors[task.priority]}` }}
                    onClick={() => navigate('/tasks')}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: priorityColors[task.priority],
                        boxShadow: `0 0 6px ${priorityColors[task.priority]}80`,
                      }} />
                      <div className="flex-1 min-w-0">
                        <div className="list-item-title">{task.title}</div>
                        {task.due_date && (
                          <div className="list-item-subtitle">
                            <Calendar size={10} />
                            {formatDate(task.due_date, { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                      <span
                        className="badge"
                        style={{ background: priorityBg[task.priority], color: priorityColors[task.priority] }}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Active Goals ── */}
        {activeGoals.length > 0 && (
          <section className="animate-fadeInUp stagger-4" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="section-header">
              <span className="section-title">
                <Target size={16} style={{ color: 'var(--color-secondary)' }} />
                Active Goals
              </span>
              <button className="section-link" onClick={() => navigate('/goals')}>
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {activeGoals.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  className="card card-interactive"
                  style={{ padding: 'var(--space-4)' }}
                  onClick={() => navigate('/goals')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold truncate" style={{ flex: 1, marginRight: 'var(--space-3)' }}>
                      {goal.title}
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--color-primary)', flexShrink: 0 }}>
                      {goal.progress ?? 0}%
                    </span>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${goal.progress ?? 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Upcoming Exams ── */}
        {upcomingExams.length > 0 && (
          <section className="animate-fadeInUp stagger-4" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="section-header">
              <span className="section-title">
                <GraduationCap size={16} style={{ color: 'var(--color-warning)' }} />
                Upcoming Exams
              </span>
              <button className="section-link" onClick={() => navigate('/study')}>
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {upcomingExams.slice(0, 3).map((exam) => (
                <div key={exam.id} className="card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                  <div className="flex items-center gap-3">
                    <div className="quick-action-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)', width: 36, height: 36, borderRadius: 'var(--radius-md)' }}>
                      <AlertCircle size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="list-item-title">{exam.title}</div>
                      <div className="list-item-subtitle">
                        <Calendar size={10} />
                        {formatDate(exam.exam_date)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Quick Action Modals ── */}

      {/* Add Task */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Add Task"
        footer={<><button className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddQuickTask}>Add Task</button></>}
      >
        <div className="input-group">
          <label className="input-label">Task Title</label>
          <input className="input" placeholder="What do you need to do?" value={quickTask}
            onChange={(e) => setQuickTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddQuickTask()}
            autoFocus id="input-quick-task" />
        </div>
      </Modal>

      {/* Add Expense */}
      <Modal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Add Expense"
        footer={<><button className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddQuickExpense}>Add Expense</button></>}
      >
        <div className="input-group">
          <label className="input-label">Amount (₹)</label>
          <input className="input" type="number" placeholder="0.00" value={quickExpense.amount}
            onChange={(e) => setQuickExpense({ ...quickExpense, amount: e.target.value })}
            autoFocus id="input-quick-expense-amount" />
        </div>
        <div className="input-group">
          <label className="input-label">Category</label>
          <select className="input select" value={quickExpense.category}
            onChange={(e) => setQuickExpense({ ...quickExpense, category: e.target.value })}
            id="select-quick-expense-category">
            <option value="food">🍕 Food & Dining</option>
            <option value="travel">✈️ Travel</option>
            <option value="education">📚 Education</option>
            <option value="shopping">🛍️ Shopping</option>
            <option value="other">📦 Other</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Description</label>
          <input className="input" placeholder="What was it for?" value={quickExpense.description}
            onChange={(e) => setQuickExpense({ ...quickExpense, description: e.target.value })}
            id="input-quick-expense-desc" />
        </div>
      </Modal>

      {/* Add Note */}
      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Note"
        footer={<><button className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddQuickNote}>Save Note</button></>}
      >
        <div className="input-group">
          <label className="input-label">Title</label>
          <input className="input" placeholder="Note title" value={quickNote.title}
            onChange={(e) => setQuickNote({ ...quickNote, title: e.target.value })}
            autoFocus id="input-quick-note-title" />
        </div>
        <div className="input-group">
          <label className="input-label">Content</label>
          <textarea className="input textarea" placeholder="Write your note..."
            value={quickNote.content}
            onChange={(e) => setQuickNote({ ...quickNote, content: e.target.value })}
            id="input-quick-note-content" />
        </div>
      </Modal>

      {/* Add Idea */}
      <Modal isOpen={showIdeaModal} onClose={() => setShowIdeaModal(false)} title="Capture Idea"
        footer={<><button className="btn btn-secondary" onClick={() => setShowIdeaModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddQuickIdea}>Save Idea</button></>}
      >
        <div className="input-group">
          <label className="input-label">What's your idea?</label>
          <input className="input" placeholder="Describe your idea..." value={quickIdea.title}
            onChange={(e) => setQuickIdea({ ...quickIdea, title: e.target.value })}
            autoFocus id="input-quick-idea-title" />
        </div>
        <div className="input-group">
          <label className="input-label">Category</label>
          <select className="input select" value={quickIdea.category}
            onChange={(e) => setQuickIdea({ ...quickIdea, category: e.target.value })}
            id="select-quick-idea-category">
            <option value="app">💡 App Idea</option>
            <option value="business">💼 Business</option>
            <option value="project">🚀 Project</option>
            <option value="research">🔬 Research</option>
          </select>
        </div>
      </Modal>
    </>
  );
}
