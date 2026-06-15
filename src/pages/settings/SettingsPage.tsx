// ============================================================
// நினைவு (Ninaivu) — Settings Page
// ============================================================

import { useState } from 'react';
import { User, Palette, Download, Upload, Shield, Moon, Sun, LogOut } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';

export default function SettingsPage() {
  const { user, isDemo, signOut, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { memory, subjects, notes, exams, studySessions, expenses, moneyTracker, investments, tasks, goals, ideas } = useData();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(user?.full_name || '');

  const handleExportBackup = () => {
    const data = { memory, subjects, notes, exams, studySessions, expenses, moneyTracker, investments, tasks, goals, ideas, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ninaivu-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exported!', 'success');
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        // Save imported data to localStorage
        localStorage.setItem('ninaivu-data', JSON.stringify(data));
        showToast('Backup imported! Refreshing...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        showToast('Invalid backup file', 'error');
      }
    };
    input.click();
  };

  const handleSaveProfile = async () => {
    await updateProfile({ full_name: fullName });
    showToast('Profile updated!', 'success');
  };

  return (
    <>
      <TopBar title="Settings" showSearch={false} />

      <div className="page" style={{ maxWidth: 600 }}>
        {/* Profile */}
        <section className="card mb-4 animate-fadeInUp">
          <div className="flex items-center gap-3 mb-4">
            <User size={20} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="avatar avatar-lg">
              {user?.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-semibold">{user?.full_name || 'Set your name'}</div>
              <div className="text-sm text-muted">{user?.email}</div>
              {isDemo && <span className="badge badge-warning" style={{ marginTop: 4 }}>Demo Mode</span>}
            </div>
          </div>

          <div className="input-group mb-3">
            <label className="input-label">Full Name</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" id="settings-name" />
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleSaveProfile}>Save Profile</button>
        </section>

        {/* Theme */}
        <section className="card mb-4 animate-fadeInUp stagger-1">
          <div className="flex items-center gap-3 mb-4">
            <Palette size={20} style={{ color: 'var(--color-secondary)' }} />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>

          <div className="flex gap-3">
            <button
              className={`card card-interactive flex-1 ${theme === 'dark' ? 'card-gradient' : ''}`}
              onClick={() => setTheme('dark')}
              style={{ padding: 'var(--space-4)', textAlign: 'center', border: theme === 'dark' ? '2px solid var(--color-primary)' : undefined }}
            >
              <Moon size={24} style={{ margin: '0 auto var(--space-2)', color: 'var(--color-primary)' }} />
              <div className="text-sm font-medium">Dark</div>
            </button>
            <button
              className={`card card-interactive flex-1 ${theme === 'light' ? 'card-gradient' : ''}`}
              onClick={() => setTheme('light')}
              style={{ padding: 'var(--space-4)', textAlign: 'center', border: theme === 'light' ? '2px solid var(--color-primary)' : undefined }}
            >
              <Sun size={24} style={{ margin: '0 auto var(--space-2)', color: 'var(--color-warning)' }} />
              <div className="text-sm font-medium">Light</div>
            </button>
          </div>
        </section>

        {/* Backup */}
        <section className="card mb-4 animate-fadeInUp stagger-2">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} style={{ color: 'var(--color-success)' }} />
            <h2 className="text-lg font-semibold">Backup & Restore</h2>
          </div>

          <div className="flex gap-3">
            <button className="btn btn-secondary flex-1" onClick={handleExportBackup} id="btn-export">
              <Download size={18} /> Export
            </button>
            <button className="btn btn-secondary flex-1" onClick={handleImportBackup} id="btn-import">
              <Upload size={18} /> Import
            </button>
          </div>
          <p className="text-xs text-muted mt-2">Export your data as JSON or import a previous backup.</p>
        </section>

        {/* Account */}
        <section className="card mb-4 animate-fadeInUp stagger-3">
          <div className="flex items-center gap-3 mb-4">
            <LogOut size={20} style={{ color: 'var(--color-error)' }} />
            <h2 className="text-lg font-semibold">Account</h2>
          </div>
          <button className="btn btn-danger btn-block" onClick={signOut} id="btn-signout">
            <LogOut size={18} /> Sign Out
          </button>
        </section>

        {/* App info */}
        <div className="text-center text-xs text-muted mt-8" style={{ paddingBottom: 'var(--space-8)' }}>
          <p>நினைவு (Ninaivu) v1.0.0</p>
          <p style={{ marginTop: 4 }}>Your personal second brain</p>
        </div>
      </div>
    </>
  );
}
