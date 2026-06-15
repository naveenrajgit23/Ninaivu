// ============================================================
// நினைவு (Ninaivu) — Sidebar Component (Desktop)
// ============================================================

import { NavLink } from 'react-router';
import { NAV_ITEMS } from '../../utils/constants';
import * as Icons from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext';

type IconName = keyof typeof Icons;

function getIcon(name: string, size = 20) {
  const IconComponent = Icons[name as IconName] as React.ComponentType<{ size: number }>;
  if (!IconComponent) return null;
  return <IconComponent size={size} />;
}

export default function Sidebar() {
  const { isSidebarOpen, setSidebarOpen } = useLayout();

  // Group nav items by section
  const sections = NAV_ITEMS.reduce((acc, item) => {
    const section = item.section || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, typeof NAV_ITEMS>);

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <div className="flex items-center gap-3" style={{ flex: 1 }}>
          <div className="sidebar-logo">நி</div>
          <span className="sidebar-brand">நினைவு</span>
        </div>
        <button
          className="btn btn-icon btn-ghost mobile-menu-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <Icons.X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            <div className="sidebar-section">{section}</div>
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item-active' : ''}`
                }
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-item-icon">{getIcon(item.icon)}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
