// ============================================================
// நினைவு (Ninaivu) — Sidebar Component (Desktop) v2
// ============================================================

import { NavLink } from 'react-router';
import { NAV_ITEMS } from '../../utils/constants';
import * as Icons from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext';

type IconName = keyof typeof Icons;

function getIcon(name: string, size = 18) {
  const IconComponent = Icons[name as IconName] as React.ComponentType<{ size: number }>;
  if (!IconComponent) return null;
  return <IconComponent size={size} />;
}

export default function Sidebar() {
  const { isSidebarOpen, setSidebarOpen, isSidebarCollapsed, toggleSidebarCollapsed } = useLayout();

  // Group nav items by section
  const sections = NAV_ITEMS.reduce((acc, item) => {
    const section = item.section || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, typeof NAV_ITEMS>);

  return (
    <aside
      className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}
      id="sidebar"
      aria-label="Main navigation"
    >
      {/* Header / Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo" aria-label="Ninaivu">நி</div>
        <span className="sidebar-brand">நினைவு</span>
        {/* Mobile close button */}
        <button
          className="btn btn-icon btn-ghost mobile-menu-toggle"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
          style={{ marginLeft: 'auto', flexShrink: 0 }}
        >
          <Icons.X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" aria-label="App sections">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="sidebar-group">
            <div className="sidebar-section-label">{section}</div>
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item-active' : ''}`
                }
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <span className="nav-item-icon">{getIcon(item.icon)}</span>
                <span className="nav-item-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>



      {/* Footer — collapse toggle */}
      <div className="sidebar-footer">
        <button
          className="sidebar-collapse-btn"
          onClick={toggleSidebarCollapsed}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          <Icons.ChevronsLeft size={16} className="sidebar-collapse-icon" />
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', opacity: isSidebarCollapsed ? 0 : 1, transition: 'opacity 0.2s ease' }}>
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}
