// ============================================================
// நினைவு (Ninaivu) — Dashboard Page
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CheckSquare, Clock, GraduationCap, AlertCircle,
  Plus, Wallet, StickyNote, Lightbulb, TrendingUp,
  ArrowRight, Calendar, Activity, CheckCircle2, Circle
} from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { getGreeting, formatDate, formatCurrency, isToday, isWithinDays } from '../../utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, exams, expenses, goals, habits, habitCompletions } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Quick action modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIdeaModal, setShowIdeaModal] = useState(false);

  // Quick action form states
  const [quickTask, setQuickTask] = useState('');
  const [quickExpense, setQuickExpense] = useState({ amount: '', category: 'food', description: '' });
  const [quickNote, setQuickNote] = useState({ title: '', content: '' });
  const [quickIdea, setQuickIdea] = useState({ title: '', category: 'app' });

  const { addItem } = useData();

  // Derived data
  const todayTasks = tasks.filter((t) => t.due_date && isToday(t.due_date) && t.status !== 'completed');
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const upcomingExams = exams.filter((e) => isWithinDays(e.exam_date, 30));
  const activeGoals = goals.filter((g) => g.status === 'active');
  const thisMonthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.expense_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const todayStr = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0');
  const activeHabits = habits || [];
  const todaysCompletions = (habitCompletions || []).filter(c => c.completed_date === todayStr);
  const completedHabitsCount = todaysCompletions.length;
  const habitProgress = activeHabits.length > 0 ? Math.round((completedHabitsCount / activeHabits.length) * 100) : 0;

  // Quick action handlers
  const handleAddQuickTask = async () => {
    if (!quickTask.trim()) return;
    await addItem('tasks', {
      title: quickTask,
      description: '',
      type: 'general',
      priority: 'medium',
      status: 'pending',
      due_date: new Date().toISOString(),
      reminder_at: null,
      completed_at: null,
      goal_id: null,
    });
    setQuickTask('');
    setShowTaskModal(false);
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
    await addItem('notes', {
      title: quickNote.title,
      content: quickNote.content,
      subject_id: null,
      type: 'note',
      tags: [],
    });
    setQuickNote({ title: '', content: '' });
    setShowNoteModal(false);
    showToast('Note added!', 'success');
  };

  const handleAddQuickIdea = async () => {
    if (!quickIdea.title.trim()) return;
    await addItem('ideas', {
      title: quickIdea.title,
      description: '',
      category: quickIdea.category as 'app' | 'business' | 'project' | 'research',
      tags: [],
      is_favorite: false,
    });
    setQuickIdea({ title: '', category: 'app' });
    setShowIdeaModal(false);
    showToast('Idea saved!', 'success');
  };

  return (
    <>
      <TopBar
        title={`${getGreeting()}`}
        subtitle={user?.full_name ? `Welcome back, ${user.full_name}` : 'Welcome back'}
      />

      <div className="page">
        {/* Quick Actions */}
        <section className="animate-fadeInUp stagger-1">
          <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
            <button className="card card-interactive" onClick={() => setShowTaskModal(true)} id="qa-add-task">
              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
                  <Plus size={22} />
                </div>
                <span className="stat-card-label">Add Task</span>
              </div>
            </button>

            <button className="card card-interactive" onClick={() => setShowExpenseModal(true)} id="qa-add-expense">
              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                  <Wallet size={22} />
                </div>
                <span className="stat-card-label">Add Expense</span>
              </div>
            </button>

            <button className="card card-interactive" onClick={() => setShowNoteModal(true)} id="qa-add-note">
              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                  <StickyNote size={22} />
                </div>
                <span className="stat-card-label">Add Note</span>
              </div>
            </button>

            <button className="card card-interactive" onClick={() => setShowIdeaModal(true)} id="qa-add-idea">
              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}>
                  <Lightbulb size={22} />
                </div>
                <span className="stat-card-label">Add Idea</span>
              </div>
            </button>
          </div>
        </section>

        {/* Overview Stats */}
        <section className="grid grid-4 animate-fadeInUp stagger-2" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <CheckSquare size={22} />
              </div>
              <span className="stat-card-value">{pendingTasks.length}</span>
              <span className="stat-card-label">Pending Tasks</span>
            </div>
          </div>

          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                <GraduationCap size={22} />
              </div>
              <span className="stat-card-value">{upcomingExams.length}</span>
              <span className="stat-card-label">Upcoming Exams</span>
            </div>
          </div>

          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                <TrendingUp size={22} />
              </div>
              <span className="stat-card-value">{activeGoals.length}</span>
              <span className="stat-card-label">Active Goals</span>
            </div>
          </div>

          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
                <Wallet size={22} />
              </div>
              <span className="stat-card-value">{formatCurrency(thisMonthExpenses)}</span>
              <span className="stat-card-label">This Month</span>
            </div>
          </div>
        </section>

        {/* Today's Habits */}
        {activeHabits.length > 0 && (
          <section className="animate-fadeInUp stagger-3" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Today's Habits</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/habits')}>
                View All <ArrowRight size={16} />
              </button>
            </div>
            
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={20} className="text-primary" />
                  <span className="font-medium">{completedHabitsCount} of {activeHabits.length} completed</span>
                </div>
                <span className="text-sm font-bold text-primary">{habitProgress}%</span>
              </div>
              
              <div style={{ width: '100%', height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
                <div style={{ height: '100%', background: 'var(--color-primary)', width: `${habitProgress}%`, transition: 'width 0.3s ease' }} />
              </div>
              
              <div className="grid grid-2 gap-2">
                {activeHabits.slice(0, 4).map(habit => {
                  const isCompleted = todaysCompletions.some(c => c.habit_id === habit.id);
                  return (
                    <div key={habit.id} className="flex items-center gap-2 p-2 rounded" style={{ background: isCompleted ? 'var(--bg-secondary)' : 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                      {isCompleted ? <CheckCircle2 size={16} className="text-success" /> : <Circle size={16} className="text-muted" />}
                      <span className={`text-sm ${isCompleted ? 'text-secondary line-through' : ''}`}>{habit.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Today's Tasks */}
        <section className="animate-fadeInUp stagger-3" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Tasks</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>
              View All <ArrowRight size={16} />
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <Clock size={32} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-3)' }} />
              <p className="text-secondary text-sm">No tasks for today. Enjoy your day!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todayTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="card card-interactive" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                  <div className="list-item" style={{ padding: 0 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: task.priority === 'high' ? 'var(--color-error)' : task.priority === 'medium' ? 'var(--color-warning)' : 'var(--color-success)',
                        flexShrink: 0,
                      }}
                    />
                    <div className="list-item-content">
                      <div className="list-item-title">{task.title}</div>
                      {task.due_date && (
                        <div className="list-item-subtitle">
                          <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                          {formatDate(task.due_date, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                    <span className={`badge badge-${task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Exams */}
        {upcomingExams.length > 0 && (
          <section className="animate-fadeInUp stagger-4" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upcoming Exams</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/study')}>
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {upcomingExams.slice(0, 3).map((exam) => (
                <div key={exam.id} className="card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                  <div className="list-item" style={{ padding: 0 }}>
                    <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)', width: 36, height: 36 }}>
                      <AlertCircle size={18} />
                    </div>
                    <div className="list-item-content">
                      <div className="list-item-title">{exam.title}</div>
                      <div className="list-item-subtitle">{formatDate(exam.exam_date)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Quick Action Modals ── */}

      {/* Add Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Add Task"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddQuickTask}>Add Task</button>
          </>
        }
      >
        <div className="input-group">
          <label className="input-label">Task Title</label>
          <input
            className="input"
            placeholder="What do you need to do?"
            value={quickTask}
            onChange={(e) => setQuickTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddQuickTask()}
            autoFocus
            id="input-quick-task"
          />
        </div>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Add Expense"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddQuickExpense}>Add Expense</button>
          </>
        }
      >
        <div className="input-group">
          <label className="input-label">Amount (₹)</label>
          <input
            className="input"
            type="number"
            placeholder="0.00"
            value={quickExpense.amount}
            onChange={(e) => setQuickExpense({ ...quickExpense, amount: e.target.value })}
            autoFocus
            id="input-quick-expense-amount"
          />
        </div>
        <div className="input-group">
          <label className="input-label">Category</label>
          <select
            className="input select"
            value={quickExpense.category}
            onChange={(e) => setQuickExpense({ ...quickExpense, category: e.target.value })}
            id="select-quick-expense-category"
          >
            <option value="food">Food</option>
            <option value="travel">Travel</option>
            <option value="education">Education</option>
            <option value="shopping">Shopping</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Description</label>
          <input
            className="input"
            placeholder="What was it for?"
            value={quickExpense.description}
            onChange={(e) => setQuickExpense({ ...quickExpense, description: e.target.value })}
            id="input-quick-expense-desc"
          />
        </div>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add Note"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddQuickNote}>Add Note</button>
          </>
        }
      >
        <div className="input-group">
          <label className="input-label">Title</label>
          <input
            className="input"
            placeholder="Note title"
            value={quickNote.title}
            onChange={(e) => setQuickNote({ ...quickNote, title: e.target.value })}
            autoFocus
            id="input-quick-note-title"
          />
        </div>
        <div className="input-group">
          <label className="input-label">Content</label>
          <textarea
            className="input textarea"
            placeholder="Write your note..."
            value={quickNote.content}
            onChange={(e) => setQuickNote({ ...quickNote, content: e.target.value })}
            id="input-quick-note-content"
          />
        </div>
      </Modal>

      {/* Add Idea Modal */}
      <Modal
        isOpen={showIdeaModal}
        onClose={() => setShowIdeaModal(false)}
        title="Add Idea"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowIdeaModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddQuickIdea}>Save Idea</button>
          </>
        }
      >
        <div className="input-group">
          <label className="input-label">Idea Title</label>
          <input
            className="input"
            placeholder="What's your idea?"
            value={quickIdea.title}
            onChange={(e) => setQuickIdea({ ...quickIdea, title: e.target.value })}
            autoFocus
            id="input-quick-idea-title"
          />
        </div>
        <div className="input-group">
          <label className="input-label">Category</label>
          <select
            className="input select"
            value={quickIdea.category}
            onChange={(e) => setQuickIdea({ ...quickIdea, category: e.target.value })}
            id="select-quick-idea-category"
          >
            <option value="app">App Idea</option>
            <option value="business">Business Idea</option>
            <option value="project">Project Idea</option>
            <option value="research">Research Idea</option>
          </select>
        </div>
      </Modal>
    </>
  );
}
