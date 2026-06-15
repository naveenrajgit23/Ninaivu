// ============================================================
// நினைவு (Ninaivu) — Ideas Page
// ============================================================

import { useState, useMemo } from 'react';
import { Plus, Search, Star, Trash2, Edit3, Lightbulb } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/helpers';
import { IDEA_CATEGORIES } from '../../utils/constants';
import type { IdeaCategory } from '../../types';

export default function IdeasPage() {
  const { ideas, addItem, updateItem, deleteItem } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<IdeaCategory | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'app' as IdeaCategory, tags: '' });

  const filtered = useMemo(() => {
    let items = ideas;
    if (filter !== 'all') items = items.filter((i) => i.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.tags.some((t) => t.toLowerCase().includes(q)));
    }
    return items;
  }, [ideas, filter, search]);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (editId) {
      await updateItem('ideas', editId, { title: form.title, description: form.description, category: form.category, tags });
      showToast('Idea updated!', 'success');
    } else {
      await addItem('ideas', { title: form.title, description: form.description, category: form.category, tags, is_favorite: false });
      showToast('Idea saved!', 'success');
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ title: '', description: '', category: 'app', tags: '' });
    setShowAdd(false);
    setEditId(null);
  };

  const startEdit = (id: string) => {
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return;
    setForm({ title: idea.title, description: idea.description, category: idea.category, tags: idea.tags.join(', ') });
    setEditId(id);
    setShowAdd(true);
  };

  return (
    <>
      <TopBar title="Ideas" subtitle={`${ideas.length} ideas captured`} />

      <div className="page">
        {/* Search */}
        <div className="search-bar mb-4">
          <span className="search-icon"><Search size={18} /></span>
          <input className="input" style={{ paddingLeft: 'var(--space-10)' }} placeholder="Search ideas..." value={search} onChange={(e) => setSearch(e.target.value)} id="ideas-search" />
        </div>

        {/* Category filter */}
        <div className="tabs mb-6">
          <button className={`tab ${filter === 'all' ? 'tab-active' : ''}`} onClick={() => setFilter('all')}>All</button>
          {(Object.keys(IDEA_CATEGORIES) as IdeaCategory[]).map((cat) => (
            <button key={cat} className={`tab ${filter === cat ? 'tab-active' : ''}`} onClick={() => setFilter(cat)}>
              {IDEA_CATEGORIES[cat].label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Lightbulb size={32} />} title="No ideas yet" description="Capture your brilliant ideas before they slip away." action={<button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Idea</button>} />
        ) : (
          <div className="grid grid-2 gap-3">
            {filtered.map((idea) => {
              const cfg = IDEA_CATEGORIES[idea.category];
              return (
                <div key={idea.id} className="card card-interactive animate-fadeInUp">
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge" style={{ background: `${cfg?.color}18`, color: cfg?.color }}>{cfg?.label}</span>
                    <div className="flex items-center gap-1">
                      <button className="btn btn-icon btn-ghost" style={{ padding: 2 }} onClick={() => { updateItem('ideas', idea.id, { is_favorite: !idea.is_favorite }); }}>
                        <Star size={14} fill={idea.is_favorite ? 'var(--color-warning)' : 'none'} color={idea.is_favorite ? 'var(--color-warning)' : 'var(--text-muted)'} />
                      </button>
                      <button className="btn btn-icon btn-ghost" style={{ padding: 2 }} onClick={() => startEdit(idea.id)}><Edit3 size={14} /></button>
                      <button className="btn btn-icon btn-ghost" style={{ padding: 2 }} onClick={() => { deleteItem('ideas', idea.id); showToast('Idea deleted', 'info'); }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="font-semibold text-sm mb-1">{idea.title}</div>
                  {idea.description && <p className="text-xs text-secondary" style={{ lineClamp: 3, WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{idea.description}</p>}
                  {idea.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {idea.tags.map((tag) => <span key={tag} className="chip" style={{ fontSize: '10px', padding: '2px 8px' }}>#{tag}</span>)}
                    </div>
                  )}
                  <div className="text-xs text-muted mt-2">{formatDate(idea.created_at)}</div>
                </div>
              );
            })}
          </div>
        )}

        <button className="fab" onClick={() => setShowAdd(true)} id="fab-add-idea"><Plus size={24} /></button>
      </div>

      <Modal isOpen={showAdd} onClose={resetForm} title={editId ? 'Edit Idea' : 'New Idea'}
        footer={<><button className="btn btn-secondary" onClick={resetForm}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editId ? 'Update' : 'Save'}</button></>}>
        <div className="input-group"><label className="input-label">Title</label><input className="input" placeholder="Your idea" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus id="idea-title" /></div>
        <div className="input-group"><label className="input-label">Category</label><select className="input select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as IdeaCategory })} id="idea-category">{Object.entries(IDEA_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
        <div className="input-group"><label className="input-label">Description</label><textarea className="input textarea" placeholder="Describe your idea..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} id="idea-desc" /></div>
        <div className="input-group"><label className="input-label">Tags (comma separated)</label><input className="input" placeholder="react, ai, saas" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} id="idea-tags" /></div>
      </Modal>
    </>
  );
}
