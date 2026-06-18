// ============================================================
// நினைவு (Ninaivu) — Main Application
// Router setup and provider hierarchy
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { DataProvider } from './contexts/DataContext';
import { TimerProvider } from './contexts/TimerContext';

// Layout
import AppShell from './components/layout/AppShell';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import SearchPage from './pages/search/SearchPage';
import MemoryPage from './pages/memory/MemoryPage';
import StudyHubPage from './pages/study/StudyHubPage';
import FocusTimerPage from './pages/study/FocusTimerPage';
import FinancePage from './pages/finance/FinancePage';
import TasksPage from './pages/tasks/TasksPage';
import GoalsPage from './pages/goals/GoalsPage';
import IdeasPage from './pages/ideas/IdeasPage';
import HabitsPage from './pages/habits/HabitsPage';
import StatisticsPage from './pages/statistics/StatisticsPage';
import SettingsPage from './pages/settings/SettingsPage';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isDemo } = useAuth();

  if (loading) {
    return (
      <div className="spinner-wrapper" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!user && !isDemo) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Auth Route — redirect to dashboard if logged in
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isDemo } = useAuth();

  if (user || isDemo) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DataProvider>
              <TimerProvider>
                <AppShell />
              </TimerProvider>
            </DataProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="memory" element={<MemoryPage />} />
        <Route path="study" element={<StudyHubPage />} />
        <Route path="study/timer" element={<FocusTimerPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="ideas" element={<IdeasPage />} />
        <Route path="habits" element={<HabitsPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
