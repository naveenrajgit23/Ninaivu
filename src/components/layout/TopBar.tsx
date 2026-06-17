// ============================================================
// நினைவு (Ninaivu) — Top Bar v2
// Glassmorphism header with search, theme, and avatar
// ============================================================

import { useNavigate } from 'react-router';
import { Search, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import { getInitials } from '../../utils/helpers';

interface TopBarProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
}

export default function TopBar({ title, subtitle, showSearch = true }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { toggleSidebar } = useLayout();
  const navigate = useNavigate();

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

        <div
          className="avatar avatar-sm avatar-interactive"
          id="user-avatar"
          onClick={() => navigate('/settings')}
          style={{ cursor: 'pointer' }}
          role="button"
          aria-label="Go to settings"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/settings')}
        >
          {user?.full_name ? getInitials(user.full_name) : '?'}
        </div>
      </div>
    </header>
  );
}
