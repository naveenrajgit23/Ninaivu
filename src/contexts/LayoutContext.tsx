import { createContext, useContext, useState } from 'react';

interface LayoutContextType {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  isMoreDrawerOpen: boolean;
  setMoreDrawerOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMoreDrawerOpen, setMoreDrawerOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleSidebarCollapsed = () => setIsSidebarCollapsed((prev) => !prev);

  return (
    <LayoutContext.Provider value={{
      isSidebarOpen, setSidebarOpen, toggleSidebar,
      isSidebarCollapsed, toggleSidebarCollapsed,
      isMoreDrawerOpen, setMoreDrawerOpen,
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
