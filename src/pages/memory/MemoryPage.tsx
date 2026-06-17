// ============================================================
// நினைவு (Ninaivu) — Memory Page
// ============================================================

import { useState, useMemo } from 'react';
import { Search, Plus, Star, Copy, Trash2, Edit3, Lock } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { copyToClipboard } from '../../utils/helpers';
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
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({ title: '', category: 'personal' as MemoryCategory, data: '' });

  const filtered = useMemo(() => {
    let items = memory;
    if (filter !== 'all') items = items.filter((m) => m.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((m) => m.title.toLowerCase().includes(q));
    }
    return items;
  }, [memory, filter, search]);

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
      <TopBar title="Memory" subtitle="Your secure personal vault" />

      <div className="page">
        {/* Search & Filter */}
        <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <span className="search-icon"><Search size={18} /></span>
            <input className="input" style={{ paddingLeft: 'var(--space-10)' }} placeholder="Search memory..." value={search} onChange={(e) => setSearch(e.target.value)} id="memory-search" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="tabs mb-6" style={{ overflowX: 'auto' }}>
          <button className={`tab ${filter === 'all' ? 'tab-active' : ''}`} onClick={() => setFilter('all')}>All</button>
          {(Object.keys(MEMORY_CATEGORIES) as MemoryCategory[]).map((cat) => (
            <button key={cat} className={`tab ${filter === cat ? 'tab-active' : ''}`} onClick={() => setFilter(cat)}>
              {MEMORY_CATEGORIES[cat].label}
            </button>
          ))}
        </div>

        {/* Memory Items */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Lock size={32} />}
            title="No memories yet"
            description="Store your important personal information securely."
            action={<button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Memory</button>}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((item) => {
              const cat = MEMORY_CATEGORIES[item.category] || MEMORY_CATEGORIES['other'];
              return (
                <div key={item.id} className="card animate-fadeInUp" style={{ padding: 'var(--space-4)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="stat-card-icon" style={{ width: 36, height: 36, background: `${cat.color}18`, color: cat.color }}>
                        {getIcon(cat.icon, 18)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{item.title}</div>
                        <div className="text-xs text-muted">{cat.label}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="btn btn-icon btn-ghost" onClick={() => updateItem('memory', item.id, { is_favorite: !item.is_favorite })}>
                        <Star size={16} fill={item.is_favorite ? 'var(--color-warning)' : 'none'} color={item.is_favorite ? 'var(--color-warning)' : 'var(--text-muted)'} />
                      </button>

                      <button className="btn btn-icon btn-ghost" onClick={() => startEdit(item.id)}>
                        <Edit3 size={16} />
                      </button>
                      <button className="btn btn-icon btn-ghost" onClick={() => { deleteItem('memory', item.id); showToast('Memory deleted', 'info'); }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Data fields */}
                  <div className="flex flex-col gap-1" style={{ marginLeft: 'calc(36px + var(--space-3))' }}>
                    {Object.entries(item.data).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between" style={{ padding: 'var(--space-1) 0' }}>
                        <span className="text-xs text-muted" style={{ minWidth: 80 }}>{key}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm" style={{ fontFamily: 'monospace' }}>
                            {String(value)}
                          </span>
                          <button
                            className="btn btn-icon btn-ghost"
                            style={{ padding: 2 }}
                            onClick={async () => {
                              await copyToClipboard(String(value));
                              showToast('Copied!', 'success');
                            }}
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FAB */}
        <button className="fab" onClick={() => setShowAdd(true)} id="fab-add-memory">
          <Plus size={24} />
        </button>
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
