// ============================================================
// நினைவு (Ninaivu) — Tasks Page
// ============================================================

import { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit3, Calendar, Check, AlertCircle } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/helpers';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../utils/constants';
import type { TaskType, TaskPriority, TaskStatus } from '../../types';

export default function TasksPage() {
  const { tasks, goals, addItem, updateItem, deleteItem } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', type: 'general' as TaskType,
    priority: 'medium' as TaskPriority, status: 'pending' as TaskStatus,
    due_date: '', goal_id: '',
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
    setForm({ title: '', description: '', type: 'general', priority: 'medium', status: 'pending', due_date: '', goal_id: '' });
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
      <TopBar title="Tasks" subtitle={`${tasks.filter((t) => t.status !== 'completed').length} pending`} />

      <div className="page">
        {/* Search */}
        <div className="search-bar mb-4">
          <span className="search-icon"><Search size={18} /></span>
          <input className="input" style={{ paddingLeft: 'var(--space-10)' }} placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} id="tasks-search" />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
          <div className="tabs" style={{ flex: 1, minWidth: 200 }}>
            {(['all', 'daily', 'weekly', 'general'] as const).map((t) => (
              <button key={t} className={`tab ${typeFilter === t ? 'tab-active' : ''}`} onClick={() => setTypeFilter(t)}>
                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-6" style={{ flexWrap: 'wrap' }}>
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((s) => (
            <button
              key={s}
              className={`chip ${statusFilter === s ? 'chip-active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All Status' : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>

        {/* Task List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CheckSquare size={32} />}
            title="No tasks found"
            description="Create your first task to get started."
            action={<button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Task</button>}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((task) => {
              const priorityCfg = PRIORITY_CONFIG[task.priority];
              return (
                <div key={task.id} className="card card-interactive animate-fadeInUp" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleComplete(task.id)}
                      style={{
                        width: 22, height: 22, borderRadius: 'var(--radius-sm)',
                        border: `2px solid ${task.status === 'completed' ? 'var(--color-success)' : 'var(--border-color)'}`,
                        background: task.status === 'completed' ? 'var(--color-success)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {task.status === 'completed' && <Check size={14} color="white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="list-item-title" style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none', opacity: task.status === 'completed' ? 0.6 : 1 }}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {task.due_date && (
                          <span className="text-xs text-muted flex items-center gap-1">
                            <Calendar size={12} /> {formatDate(task.due_date)}
                          </span>
                        )}
                        <span className="badge" style={{ background: priorityCfg.bgColor, color: priorityCfg.color, fontSize: '10px' }}>
                          {priorityCfg.label}
                        </span>
                        {task.type !== 'general' && <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{task.type}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button className="btn btn-icon btn-ghost" onClick={() => startEdit(task.id)} style={{ padding: 4 }}>
                        <Edit3 size={15} />
                      </button>
                      <button className="btn btn-icon btn-ghost" onClick={() => { deleteItem('tasks', task.id); showToast('Task deleted', 'info'); }} style={{ padding: 4 }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button className="fab" onClick={() => setShowAdd(true)} id="fab-add-task">
          <Plus size={24} />
        </button>
      </div>

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
        {goals.length > 0 && (
          <div className="input-group">
            <label className="input-label">Link to Goal (optional)</label>
            <select className="input select" value={form.goal_id} onChange={(e) => setForm({ ...form, goal_id: e.target.value })} id="task-goal">
              <option value="">None</option>
              {goals.filter((g) => g.status === 'active').map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
        )}
      </Modal>
    </>
  );
}

// Re-export CheckSquare for the empty state
function CheckSquare(props: { size: number }) {
  return <AlertCircle {...props} />;
}
