// ============================================================
// நினைவு (Ninaivu) — Bottom Navigation v2 (Mobile)
// 5-item nav + "More" drawer for remaining links
// ============================================================

import { NavLink, useLocation } from 'react-router';
import * as Icons from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext';
import { NAV_ITEMS } from '../../utils/constants';

type IconName = keyof typeof Icons;

function getIcon(name: string, size = 24) {
  const IconComponent = Icons[name as IconName] as React.ComponentType<{ size: number }>;
  if (!IconComponent) return null;
  return <IconComponent size={size} />;
}

// The 5 primary items always visible
const PRIMARY_ITEMS = [
  { path: '/habits', label: 'Habits', icon: 'Activity' },
  { path: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
  { path: '/', label: 'Home', icon: 'LayoutDashboard' },
  { path: '/finance', label: 'Finance', icon: 'Wallet' },
];

// Items that go into the "More" drawer
const MORE_ITEMS = NAV_ITEMS.filter(
  (item) => !PRIMARY_ITEMS.some((p) => p.path === item.path)
);

export default function BottomNav() {
  const { isMoreDrawerOpen, setMoreDrawerOpen } = useLayout();
  const location = useLocation();

  const isMoreActive = MORE_ITEMS.some((item) => {
    if (item.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.path);
  });

  return (
    <>
      {/* Main bottom nav bar */}
      <nav className="bottomnav" id="bottom-nav" aria-label="Mobile navigation">
        {PRIMARY_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `bottomnav-item ${isActive ? 'active' : ''}`
            }
            onClick={() => setMoreDrawerOpen(false)}
          >
            {({ isActive }) => (
              <>
                <div className="bottomnav-pill" />
                <span className="bottomnav-icon">{getIcon(item.icon, isActive ? 24 : 22)}</span>
                <span className="bottomnav-label">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* "More" button */}
        <button
          className={`bottomnav-item ${isMoreDrawerOpen || isMoreActive ? 'active' : ''}`}
          onClick={() => setMoreDrawerOpen(!isMoreDrawerOpen)}
          aria-label="More navigation options"
          aria-expanded={isMoreDrawerOpen}
        >
          <div className="bottomnav-pill" />
          <span className="bottomnav-icon">
            {isMoreDrawerOpen ? <Icons.X size={24} /> : <Icons.Grid3X3 size={22} />}
          </span>
          <span className="bottomnav-label">More</span>
        </button>
      </nav>

      {/* More Drawer */}
      {isMoreDrawerOpen && (
        <>
          <div
            className="more-drawer-overlay"
            onClick={() => setMoreDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="more-drawer" role="dialog" aria-label="More navigation options">
            <div className="more-drawer-handle" />
            <div className="more-drawer-grid">
              {MORE_ITEMS.map((item) => {
                const isActive = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`more-drawer-item ${isActive ? 'active' : ''}`}
                    onClick={() => setMoreDrawerOpen(false)}
                    end={item.path === '/'}
                  >
                    <div className="more-drawer-icon">
                      {getIcon(item.icon, 22)}
                    </div>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
