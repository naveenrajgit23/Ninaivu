// ============================================================
// நினைவு (Ninaivu) — Memory Page
// ============================================================

import { useState, useMemo } from 'react';
import { Search, Plus, Star, Copy, Edit3, Lock, Folder, Tag } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { copyToClipboard, formatDate } from '../../utils/helpers';
import { MEMORY_CATEGORIES } from '../../utils/constants';
import type { MemoryCategory } from '../../types';
import * as Icons from 'lucide-react';

type IconName = keyof typeof Icons;
function getIcon(name: string, size = 20) {
  const Comp = Icons[name as IconName] as React.ComponentType<{ size: number }>;
  return Comp ? <Comp size={size} /> : null;
}

export default function MemoryPage() {
  const { memory, addItem, updateItem, deleteItem } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MemoryCategory | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({ title: '', category: 'personal' as MemoryCategory, data: '' });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      await deleteItem('memory', id);
      showToast('Memory deleted successfully', 'success');
    }
  };

  const filtered = useMemo(() => {
    let items = memory;
    if (filter !== 'all') items = items.filter((m) => m.category === filter);
    if (showFavoritesOnly) items = items.filter(m => m.is_favorite);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((m) => m.title.toLowerCase().includes(q));
    }
    return items;
  }, [memory, filter, search, showFavoritesOnly]);

  const favoritesCount = memory.filter(m => m.is_favorite).length;
  const categoriesCount = new Set(memory.map(m => m.category)).size;


  const handleSave = async () => {
    if (!form.title.trim()) return;
    const dataObj: Record<string, string> = {};
    form.data.split('\n').forEach((line) => {
      const [key, ...rest] = line.split(':');
      if (key?.trim() && rest.length) {
        dataObj[key.trim()] = rest.join(':').trim();
      }
    });

    if (editId) {
      await updateItem('memory', editId, { title: form.title, category: form.category, data: dataObj });
      showToast('Memory updated!', 'success');
    } else {
      await addItem('memory', {
        title: form.title,
        category: form.category,
        data: dataObj,
        is_favorite: false,
        is_encrypted: false,
      });
      showToast('Memory saved!', 'success');
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ title: '', category: 'personal', data: '' });
    setShowAdd(false);
    setEditId(null);
  };

  const startEdit = (id: string) => {
    const item = memory.find((m) => m.id === id);
    if (!item) return;
    const dataStr = Object.entries(item.data).map(([k, v]) => `${k}: ${v}`).join('\n');
    setForm({ title: item.title, category: item.category, data: dataStr });
    setEditId(id);
    setShowAdd(true);
  };

  return (
    <>
      <TopBar title="Memory Vault" subtitle="Your secure space for important memories." />

      <div className="page">
        {/* Stat Cards */}
        <div className="grid grid-3 mb-6 animate-fadeInUp">
          <div className="card" style={{ padding: 'var(--space-4)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', width: 40, height: 40 }}>
                <Folder size={20} />
              </div>
              <div>
                <div className="text-xs font-medium text-secondary">Total Memories</div>
                <div className="text-2xl font-bold">{memory.length}</div>
              </div>
            </div>
            <div className="text-xs text-muted">All your saved memories</div>
          </div>

          <div className="card" style={{ padding: 'var(--space-4)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)', width: 40, height: 40 }}>
                <Star size={20} />
              </div>
              <div>
                <div className="text-xs font-medium text-secondary">Favorites</div>
                <div className="text-2xl font-bold">{favoritesCount}</div>
              </div>
            </div>
            <div className="text-xs text-muted">Marked as favorite</div>
          </div>

          <div className="card" style={{ padding: 'var(--space-4)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', width: 40, height: 40 }}>
                <Tag size={20} />
              </div>
              <div>
                <div className="text-xs font-medium text-secondary">Categories</div>
                <div className="text-2xl font-bold">{categoriesCount}</div>
              </div>
            </div>
            <div className="text-xs text-muted">Personal, Other</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 animate-fadeInUp stagger-1" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div className="search-bar flex-1" style={{ minWidth: 'min(100%, 250px)' }}>
            <span className="search-icon"><Search size={16} /></span>
            <input className="input" style={{ paddingLeft: 'var(--space-10)' }} placeholder="Search memories..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          
          <div className="tabs" style={{ margin: 0, padding: 0, background: 'transparent' }}>
            <button className={`tab ${filter === 'all' ? 'tab-active' : ''}`} style={{ background: filter === 'all' ? 'var(--color-primary-light)' : 'transparent', color: filter === 'all' ? 'var(--color-primary)' : 'var(--text-secondary)' }} onClick={() => setFilter('all')}>All</button>
            <button className={`tab ${filter === 'personal' ? 'tab-active' : ''}`} style={{ background: filter === 'personal' ? 'var(--color-primary-light)' : 'transparent', color: filter === 'personal' ? 'var(--color-primary)' : 'var(--text-secondary)' }} onClick={() => setFilter('personal')}>Personal Data</button>
            <button className={`tab ${filter === 'other' ? 'tab-active' : ''}`} style={{ background: filter === 'other' ? 'var(--color-primary-light)' : 'transparent', color: filter === 'other' ? 'var(--color-primary)' : 'var(--text-secondary)' }} onClick={() => setFilter('other')}>Other</button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="btn btn-secondary" onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} style={{ background: showFavoritesOnly ? 'var(--bg-elevated)' : 'transparent', borderColor: 'var(--border-color)' }}>
              <Star size={16} fill={showFavoritesOnly ? 'var(--color-warning)' : 'none'} color={showFavoritesOnly ? 'var(--color-warning)' : 'var(--text-primary)'} />
              Favorites
            </button>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> New Memory
            </button>
          </div>
        </div>

        {/* Memory Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Lock size={32} />}
            title="No memories found"
            description="Store your important personal information securely."
            action={<button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Memory</button>}
          />
        ) : (
          <div className="grid grid-3 gap-4 mb-6">
            {filtered.map((item) => {
              const cat = MEMORY_CATEGORIES[item.category] || MEMORY_CATEGORIES['other'];
              const dataEntries = Object.entries(item.data);
              const previewText = dataEntries.map(([k, v]) => `${k}: ${v}`).join('. ').substring(0, 80) + '...';
              
              return (
                <div key={item.id} className="card animate-fadeInUp" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
                  <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="stat-card-icon" style={{ width: 40, height: 40, background: `${cat.color}18`, color: cat.color }}>
                        {getIcon(cat.icon, 20)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold" style={{ color: cat.color }}>{cat.label}</div>
                        <div className="font-bold text-base">{item.title}</div>
                        <div className="text-xs text-muted mt-1">{formatDate(item.created_at)} • {Object.keys(item.data).length} items</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button className="btn btn-icon btn-ghost text-muted" onClick={() => updateItem('memory', item.id, { is_favorite: !item.is_favorite })} style={{ padding: 4 }}>
                        <Star size={16} fill={item.is_favorite ? 'var(--color-warning)' : 'none'} color={item.is_favorite ? 'var(--color-warning)' : 'currentColor'} />
                      </button>
                      <button className="btn btn-icon btn-ghost text-muted" style={{ padding: 4 }}>
                        <Icons.MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-secondary mb-4 flex-1">
                    {previewText}
                  </p>
                  
                  <div className="flex flex-wrap justify-between items-center mt-auto gap-2">
                    <div className="badge" style={{ background: `${cat.color}18`, color: cat.color, fontSize: '10px' }}>
                      <Tag size={10} style={{ marginRight: 4 }} /> {cat.label}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-icon btn-ghost" style={{ padding: 4 }} onClick={() => startEdit(item.id)} title="Edit">
                        <Edit3 size={14} className="text-muted" />
                      </button>
                      <button className="btn btn-icon btn-ghost" style={{ padding: 4 }} onClick={() => handleDelete(item.id)} title="Delete">
                        <Icons.Trash2 size={14} className="text-muted" />
                      </button>
                      <button className="btn btn-icon btn-ghost" style={{ padding: 4 }} onClick={async () => {
                        await copyToClipboard(JSON.stringify(item.data));
                        showToast('Copied to clipboard!', 'success');
                      }} title="Copy">
                        <Copy size={14} className="text-muted" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAdd}
        onClose={resetForm}
        title={editId ? 'Edit Memory' : 'Add Memory'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Update' : 'Save'}</button>
          </>
        }
      >
        <div className="input-group">
          <label className="input-label">Title</label>
          <input className="input" placeholder="e.g., Gmail Account" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus maxLength={200} id="memory-title" />
        </div>
        <div className="input-group">
          <label className="input-label">Category</label>
          <select className="input select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MemoryCategory })} id="memory-category">
            {(Object.keys(MEMORY_CATEGORIES) as MemoryCategory[]).map((cat) => (
              <option key={cat} value={cat}>{MEMORY_CATEGORIES[cat].label}</option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Data (key: value, one per line)</label>
          <textarea className="input textarea" placeholder={"Email: user@example.com\nPassword: xxxxxxxx"} value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} maxLength={5000} id="memory-data" />
        </div>
      </Modal>
    </>
  );
}
