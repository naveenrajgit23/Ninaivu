import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ToastContainer from '../ui/ToastContainer';
import { LayoutProvider, useLayout } from '../../contexts/LayoutContext';

function AppShellContent() {
  const { isSidebarOpen, setSidebarOpen } = useLayout();

  return (
    <div className="app-shell">
      <Sidebar />
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? 'backdrop-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <main className="app-content">
        <Outlet />
      </main>
      <BottomNav />
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
