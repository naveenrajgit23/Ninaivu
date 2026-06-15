// ============================================================
// நினைவு (Ninaivu) — Universal Search Page
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, Brain, StickyNote, GraduationCap, Wallet, CheckSquare, Target, Lightbulb } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import EmptyState from '../../components/ui/EmptyState';
import { useData } from '../../contexts/DataContext';
import type { SearchResult } from '../../types';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  memory: <Brain size={18} />,
  note: <StickyNote size={18} />,
  subject: <GraduationCap size={18} />,
  expense: <Wallet size={18} />,
  task: <CheckSquare size={18} />,
  goal: <Target size={18} />,
  idea: <Lightbulb size={18} />,
};

const TYPE_COLORS: Record<string, string> = {
  memory: '#3B82F6',
  note: '#F59E0B',
  subject: '#8B5CF6',
  expense: '#10B981',
  task: '#6366F1',
  goal: '#EC4899',
  idea: '#F59E0B',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { memory, notes, subjects, expenses, tasks, goals, ideas } = useData();

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    // Search memory
    memory.forEach((m) => {
      if (m.title.toLowerCase().includes(q)) {
        matches.push({ id: m.id, type: 'memory', title: m.title, subtitle: m.category, path: '/memory' });
      }
    });

    // Search notes
    notes.forEach((n) => {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        matches.push({ id: n.id, type: 'note', title: n.title, subtitle: n.type, path: '/study' });
      }
    });

    // Search subjects
    subjects.forEach((s) => {
      if (s.name.toLowerCase().includes(q)) {
        matches.push({ id: s.id, type: 'subject', title: s.name, subtitle: 'Subject', path: '/study' });
      }
    });

    // Search tasks
    tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) {
        matches.push({ id: t.id, type: 'task', title: t.title, subtitle: `${t.priority} priority`, path: '/tasks' });
      }
    });

    // Search goals
    goals.forEach((g) => {
      if (g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)) {
        matches.push({ id: g.id, type: 'goal', title: g.title, subtitle: `${g.progress}% complete`, path: '/goals' });
      }
    });

    // Search ideas
    ideas.forEach((i) => {
      if (i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)) {
        matches.push({ id: i.id, type: 'idea', title: i.title, subtitle: i.category, path: '/ideas' });
      }
    });

    // Search expenses
    expenses.forEach((e) => {
      if (e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)) {
        matches.push({ id: e.id, type: 'expense', title: e.description || e.category, subtitle: `₹${e.amount}`, path: '/finance' });
      }
    });

    return matches;
  }, [query, memory, notes, subjects, expenses, tasks, goals, ideas]);

  // Group results by type
  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach((r) => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return groups;
  }, [results]);

  return (
    <>
      <TopBar title="Search" showSearch={false} />

      <div className="page">
        {/* Search Input */}
        <div className="search-bar" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="search-icon"><Search size={20} /></span>
          <input
            className="input"
            style={{ paddingLeft: 'var(--space-12)' }}
            placeholder="Search across all modules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            id="search-input"
          />
        </div>

        {/* Results */}
        {query.trim() && results.length === 0 && (
          <EmptyState
            icon={<Search size={32} />}
            title="No results found"
            description={`Nothing matches "${query}". Try different keywords.`}
          />
        )}

        {Object.entries(grouped).map(([type, items]) => (
          <section key={type} className="animate-fadeInUp" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="text-sm font-semibold text-muted" style={{ marginBottom: 'var(--space-2)', textTransform: 'capitalize' }}>
              {type === 'note' ? 'Notes' : type + 's'} ({items.length})
            </h3>
            <div className="flex flex-col gap-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  className="list-item"
                  onClick={() => navigate(item.path)}
                  style={{ width: '100%', textAlign: 'left', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}
                >
                  <div
                    className="stat-card-icon"
                    style={{
                      width: 36,
                      height: 36,
                      background: `${TYPE_COLORS[item.type]}18`,
                      color: TYPE_COLORS[item.type],
                    }}
                  >
                    {TYPE_ICONS[item.type]}
                  </div>
                  <div className="list-item-content">
                    <div className="list-item-title">{item.title}</div>
                    <div className="list-item-subtitle">{item.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}

        {!query.trim() && (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-muted)' }}>
            <Search size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.3 }} />
            <p className="text-sm">Start typing to search across all your data</p>
          </div>
        )}
      </div>
    </>
  );
}
