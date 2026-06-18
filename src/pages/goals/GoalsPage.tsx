// ============================================================
// நினைவு (Ninaivu) — Goals Page
// ============================================================

import { useState } from 'react';
import { Plus, Target, Trash2, Edit3, Link2 } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/helpers';
import type { GoalStatus } from '../../types';

export default function GoalsPage() {
  const { goals, tasks, addItem, updateItem, deleteItem } = useData();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<GoalStatus | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', target_date: '', progress: 0, status: 'active' as GoalStatus });

  const filtered = filter === 'all' ? goals : goals.filter((g) => g.status === filter);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const payload = { ...form, target_date: form.target_date || null };
    if (editId) {
      await updateItem('goals', editId, payload);
      showToast('Goal updated!', 'success');
    } else {
      await addItem('goals', payload);
      showToast('Goal created!', 'success');
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ title: '', description: '', target_date: '', progress: 0, status: 'active' });
    setShowAdd(false);
    setEditId(null);
  };

  const startEdit = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    setForm({ title: goal.title, description: goal.description, target_date: goal.target_date || '', progress: goal.progress, status: goal.status });
    setEditId(id);
    setShowAdd(true);
  };

  return (
    <>
      <TopBar title="Goals" subtitle={`${goals.filter((g) => g.status === 'active').length} active`} />

      <div className="page">
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'active', 'completed'] as const).map((s) => (
            <button key={s} className={`chip ${filter === s ? 'chip-active' : ''}`} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Target size={32} />} title="✨ What's your next milestone?" description="Define your direction. Break it down. Make it happen." action={<button className="btn btn-primary" onClick={() => setShowAdd(true)}>Create Goal</button>} />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((goal) => {
              const linkedTasks = tasks.filter((t) => t.goal_id === goal.id);
              const completedTasks = linkedTasks.filter((t) => t.status === 'completed').length;
              return (
                <div key={goal.id} className="card animate-fadeInUp">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="stat-card-icon" style={{ background: goal.status === 'completed' ? 'var(--color-success-light)' : 'var(--color-primary-light)', color: goal.status === 'completed' ? 'var(--color-success)' : 'var(--color-primary)', width: 40, height: 40 }}>
                        <Target size={20} />
                      </div>
                      <div>
                        <div className="font-semibold">{goal.title}</div>
                        {goal.target_date && <div className="text-xs text-muted">Target: {formatDate(goal.target_date)}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="btn btn-icon btn-ghost" onClick={() => startEdit(goal.id)} style={{ padding: 4 }}><Edit3 size={16} /></button>
                      <button className="btn btn-icon btn-ghost" onClick={() => { deleteItem('goals', goal.id); showToast('Goal deleted', 'info'); }} style={{ padding: 4 }}><Trash2 size={16} /></button>
                    </div>
                  </div>

                  {goal.description && <p className="text-sm text-secondary mb-3">{goal.description}</p>}

                  {/* Progress */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="progress flex-1"><div className="progress-bar" style={{ width: `${goal.progress}%` }} /></div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{goal.progress}%</span>
                  </div>

                  {/* Linked tasks */}
                  {linkedTasks.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <Link2 size={14} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs text-muted">{completedTasks}/{linkedTasks.length} linked tasks completed</span>
                    </div>
                  )}

                  {goal.status === 'active' && goal.progress < 100 && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <button className="btn btn-sm btn-ghost" onClick={() => updateItem('goals', goal.id, { progress: Math.min(100, goal.progress + 10) })}>+10%</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => updateItem('goals', goal.id, { progress: 100, status: 'completed' })}>Mark Complete</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button className="fab" onClick={() => setShowAdd(true)} id="fab-add-goal"><Plus size={24} /></button>
      </div>

      <Modal isOpen={showAdd} onClose={resetForm} title={editId ? 'Edit Goal' : 'New Goal'}
        footer={<><button className="btn btn-secondary" onClick={resetForm}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editId ? 'Update' : 'Create'}</button></>}>
        <div className="input-group"><label className="input-label">Title</label><input className="input" placeholder="Goal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus id="goal-title" /></div>
        <div className="input-group"><label className="input-label">Description</label><textarea className="input textarea" placeholder="Describe your goal..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} id="goal-desc" /></div>
        <div className="grid grid-2 gap-3">
          <div className="input-group"><label className="input-label">Target Date</label><input className="input" type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} id="goal-date" /></div>
          <div className="input-group"><label className="input-label">Progress ({form.progress}%)</label><input className="input" type="range" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) })} id="goal-progress" /></div>
        </div>
      </Modal>
    </>
  );
}
