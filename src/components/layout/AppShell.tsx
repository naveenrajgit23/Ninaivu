// ============================================================
// நினைவு (Ninaivu) — App Shell v2
// ============================================================

import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import ToastContainer from '../ui/ToastContainer';
import { LayoutProvider, useLayout } from '../../contexts/LayoutContext';

function AppShellContent() {
  const { isSidebarOpen, setSidebarOpen } = useLayout();

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Backdrop */}
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? 'backdrop-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Main Content */}
      <main className="app-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function AppShell() {
  return (
    <LayoutProvider>
      <AppShellContent />
    </LayoutProvider>
  );
}
