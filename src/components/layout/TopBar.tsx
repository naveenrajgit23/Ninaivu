// ============================================================
// நினைவு (Ninaivu) — Top Bar v3
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Moon, Sun, Bell, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLayout } from '../../contexts/LayoutContext';
import { useToast } from '../../contexts/ToastContext';
import ProfileAvatar from './ProfileAvatar';

interface TopBarProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
}

export default function TopBar({ title, subtitle, showSearch = true }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar } = useLayout();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [hasNotifications, setHasNotifications] = useState(true);

  const handleNotificationClear = () => {
    if (hasNotifications) {
      setHasNotifications(false);
      showToast('All notifications marked as read.', 'success');
    } else {
      showToast('No new notifications.', 'info');
    }
  };

  return (
    <header className="topbar" id="topbar">
      <div className="topbar-left">
        {/* Mobile hamburger */}
        <button
          className="btn btn-icon btn-ghost mobile-menu-toggle"
          onClick={toggleSidebar}
          aria-label="Open menu"
          id="btn-mobile-menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="topbar-title">{title}</h1>
          {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="topbar-actions">
        {showSearch && (
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => navigate('/search')}
            aria-label="Search"
            id="btn-search"
          >
            <Search size={18} />
          </button>
        )}

        <button
          className="btn btn-icon btn-ghost"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          id="btn-theme-toggle"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Bell notification */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-icon btn-ghost"
            aria-label="Notifications"
            id="btn-notifications"
            onClick={handleNotificationClear}
          >
            <Bell size={18} />
          </button>
          {hasNotifications && (
            <span style={{
              position: 'absolute', top: '2px', right: '2px',
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'var(--color-error)',
              border: '1.5px solid var(--bg-card)',
            }} />
          )}
        </div>

        <ProfileAvatar />
      </div>
    </header>
  );
}
