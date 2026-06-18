import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, LogOut } from 'lucide-react';

export default function ProfileAvatar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleSignOutClick = async () => {
    setIsOpen(false);
    await signOut();
  };

  const initial = user?.full_name?.charAt(0).toUpperCase() || 'A';

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Avatar Button */}
      <button
        onClick={handleToggle}
        className="avatar-btn"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Account menu"
      >
        {initial}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="account-dropdown-menu">
          {/* User Info Header */}
          <div style={{ padding: '8px 12px 10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name || 'Guest User'}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
              {user?.email || 'Demo Account'}
            </div>
          </div>

          {/* Menu Items */}
          <button
            onClick={handleSettingsClick}
            className="dropdown-item"
          >
            <Settings size={16} />
            <span>Account Settings</span>
          </button>

          <button
            onClick={handleSignOutClick}
            className="dropdown-item text-danger"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
