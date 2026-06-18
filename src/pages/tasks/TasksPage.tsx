// ============================================================
// நினைவு (Ninaivu) — Tasks Page
// ============================================================

import { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit3, Calendar, Check, AlertCircle, Star, Clock } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/helpers';
import { PRIORITY_CONFIG } from '../../utils/constants';
import ProgressRing from '../../components/ui/ProgressRing';
import type { TaskType, TaskPriority, TaskStatus } from '../../types';

export default function TasksPage() {
  const { tasks, addItem, updateItem, deleteItem } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const getLocalDateString = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  const [form, setForm] = useState({
    title: '', description: '', type: 'general' as TaskType,
    priority: 'medium' as TaskPriority, status: 'pending' as TaskStatus,
    due_date: getLocalDateString(), goal_id: '',
  });

  const filtered = useMemo(() => {
    let items = tasks;
    if (typeFilter !== 'all') items = items.filter((t) => t.type === typeFilter);
    if (statusFilter !== 'all') items = items.filter((t) => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return items;
  }, [tasks, typeFilter, statusFilter, search]);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      priority: form.priority,
      status: form.status,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      reminder_at: null,
      completed_at: form.status === 'completed' ? new Date().toISOString() : null,
      goal_id: form.goal_id || null,
    };
    if (editId) {
      await updateItem('tasks', editId, payload);
      showToast('Task updated!', 'success');
    } else {
      await addItem('tasks', payload);
      showToast('Task added!', 'success');
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ title: '', description: '', type: 'general', priority: 'medium', status: 'pending', due_date: getLocalDateString(), goal_id: '' });
    setShowAdd(false);
    setEditId(null);
  };

  const startEdit = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setForm({
      title: task.title, description: task.description, type: task.type,
      priority: task.priority, status: task.status,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      goal_id: task.goal_id || '',
    });
    setEditId(id);
    setShowAdd(true);
  };

  const toggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateItem('tasks', id, {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    });
    showToast(newStatus === 'completed' ? 'Task completed!' : 'Task reopened', 'success');
  };

  return (
    <>
      <TopBar title="Tasks" subtitle={`${pendingCount} pending tasks`} />

      <div className="page">
        
        {/* Progress Banner */}
        <div className="card animate-fadeInUp mb-6" style={{ padding: 'var(--space-6)', position: 'relative', overflow: 'hidden' }}>
          <div className="flex flex-wrap items-center gap-8 relative z-10">
            <div>
              <div className="text-xs font-semibold mb-3">Today's Progress</div>
              <ProgressRing progress={progressPct} size={100} strokeWidth={8} color="var(--color-primary)">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">{progressPct}%</span>
                </div>
              </ProgressRing>
            </div>
            
            <div className="flex flex-col justify-center flex-1">
              <div className="flex flex-wrap items-center gap-8 mb-2">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{pendingCount}</div>
                  <div className="text-xs text-secondary">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{completedCount}</div>
                  <div className="text-xs text-secondary">Completed</div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="progress flex-1" style={{ height: 6, background: 'var(--bg-secondary)' }}>
                  <div className="progress-bar" style={{ width: `${progressPct}%`, background: 'var(--color-primary)' }} />
                </div>
              </div>
              <div className="text-xs text-muted mt-2">{pendingCount} of {totalCount} tasks remaining</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200, maxWidth: 300 }}>
            <span className="search-icon"><Search size={16} /></span>
            <input className="input" style={{ paddingLeft: 'var(--space-10)' }} placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} id="tasks-search" />
          </div>

          <div className="tabs" style={{ margin: 0, padding: 0, background: 'transparent' }}>
            <button className={`tab ${statusFilter === 'all' ? 'tab-active' : ''}`} style={{ background: statusFilter === 'all' ? 'var(--color-primary-light)' : 'transparent', color: statusFilter === 'all' ? 'var(--color-primary)' : 'var(--text-secondary)' }} onClick={() => setStatusFilter('all')}>All</button>
            <button className={`tab ${statusFilter === 'pending' ? 'tab-active' : ''}`} style={{ background: statusFilter === 'pending' ? 'var(--color-primary-light)' : 'transparent', color: statusFilter === 'pending' ? 'var(--color-primary)' : 'var(--text-secondary)' }} onClick={() => setStatusFilter('pending')}>Today</button>
            <button className={`tab ${statusFilter === 'in_progress' ? 'tab-active' : ''}`} style={{ background: statusFilter === 'in_progress' ? 'var(--color-primary-light)' : 'transparent', color: statusFilter === 'in_progress' ? 'var(--color-primary)' : 'var(--text-secondary)' }} onClick={() => setStatusFilter('in_progress')}>Upcoming</button>
            <button className={`tab ${statusFilter === 'completed' ? 'tab-active' : ''}`} style={{ background: statusFilter === 'completed' ? 'var(--color-primary-light)' : 'transparent', color: statusFilter === 'completed' ? 'var(--color-primary)' : 'var(--text-secondary)' }} onClick={() => setStatusFilter('completed')}>Completed</button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-secondary">
              Priority 
              <select className="input select" style={{ padding: '4px 24px 4px 8px', minHeight: 32 }} onChange={(e) => setTypeFilter(e.target.value as any)}>
                <option value="all">All</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>

        {/* Task List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<AlertCircle size={32} />}
            title="✨ Nothing pending here."
            description="Enjoy your free time or add a new task."
            action={<button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Task</button>}
          />
        ) : (
          <div className="flex flex-col gap-3 mb-6">
            {filtered.map((task) => {
              const priorityCfg = PRIORITY_CONFIG[task.priority];
              return (
                <div key={task.id} className={`card card-interactive animate-fadeInUp task-item-bordered priority-${task.priority}`} style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleComplete(task.id)}
                      style={{
                        width: 22, height: 22, borderRadius: '50%',
                        border: `2px solid ${task.status === 'completed' ? 'var(--color-success)' : 'var(--border-strong)'}`,
                        background: task.status === 'completed' ? 'var(--color-success)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {task.status === 'completed' && <Check size={14} color="white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="list-item-title text-base" style={{ 
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none', 
                        opacity: task.status === 'completed' ? 0.6 : 1,
                        transition: 'all var(--transition-normal)',
                        marginBottom: task.description ? '4px' : '0'
                      }}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-sm text-secondary mb-2" style={{ opacity: task.status === 'completed' ? 0.6 : 1 }}>
                          {task.description}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {task.due_date && (
                          <span className="text-xs text-primary font-medium flex items-center gap-1" style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
                            <Calendar size={12} className="text-primary" /> {formatDate(task.due_date)}
                          </span>
                        )}
                        <span className="text-xs font-semibold flex items-center gap-1" style={{ background: `${priorityCfg.bgColor}30`, color: priorityCfg.color, padding: '2px 8px', borderRadius: '4px' }}>
                          {priorityCfg.label}
                        </span>
                        <span className="text-xs text-secondary flex items-center gap-1">
                          <Clock size={12} /> 30 mins
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <button className="btn btn-icon btn-ghost text-muted" style={{ padding: 4 }}>
                          <Star size={16} />
                        </button>
                        <button className="btn btn-icon btn-ghost text-muted" onClick={() => startEdit(task.id)} style={{ padding: 4 }}>
                          <Edit3 size={16} />
                        </button>
                        <button className="btn btn-icon btn-ghost text-muted" onClick={() => { deleteItem('tasks', task.id); showToast('Task deleted', 'info'); }} style={{ padding: 4 }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showAdd} onClose={resetForm} title={editId ? 'Edit Task' : 'New Task'}
        footer={<>
          <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Update' : 'Create'}</button>
        </>}
      >
        <div className="input-group">
          <label className="input-label">Title</label>
          <input className="input" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus id="task-title" />
        </div>
        <div className="input-group">
          <label className="input-label">Description</label>
          <textarea className="input textarea" placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} id="task-desc" />
        </div>
        <div className="grid grid-2 gap-3">
          <div className="input-group">
            <label className="input-label">Type</label>
            <select className="input select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TaskType })} id="task-type">
              <option value="general">General</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Priority</label>
            <select className="input select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} id="task-priority">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div className="grid grid-2 gap-3">
          <div className="input-group">
            <label className="input-label">Status</label>
            <select className="input select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })} id="task-status">
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Due Date</label>
            <input className="input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} id="task-due" />
          </div>
        </div>
      </Modal>
    </>
  );
}
