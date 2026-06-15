// ============================================================
// நினைவு (Ninaivu) — Bottom Navigation (Mobile)
// ============================================================

import { NavLink } from 'react-router';
import { BOTTOM_NAV_ITEMS } from '../../utils/constants';
import * as Icons from 'lucide-react';

type IconName = keyof typeof Icons;

function getIcon(name: string, size = 22) {
  const IconComponent = Icons[name as IconName] as React.ComponentType<{ size: number }>;
  if (!IconComponent) return null;
  return <IconComponent size={size} />;
}

export default function BottomNav() {
  return (
    <nav className="bottomnav" id="bottom-nav">
      {BOTTOM_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `bottomnav-item ${isActive ? 'bottomnav-item-active' : ''}`
          }
          end={item.path === '/'}
        >
          <span className="bottomnav-icon">{getIcon(item.icon)}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
