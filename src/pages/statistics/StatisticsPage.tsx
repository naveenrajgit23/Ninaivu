// ============================================================
// நினைவு (Ninaivu) — Statistics Page
// ============================================================

import { useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend,
} from 'recharts';
import { CheckSquare, Clock, Wallet, Target, TrendingUp, Lightbulb } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, formatDuration } from '../../utils/helpers';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import type { ExpenseCategory } from '../../types';


export default function StatisticsPage() {
  const { tasks, studySessions, expenses, investments, goals, ideas } = useData();

  // Task stats
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;

  // Study stats
  const totalStudyMinutes = studySessions.reduce((sum, s) => sum + s.duration_minutes, 0);

  // Expense stats
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Investment stats
  const totalInvested = investments.reduce((sum, i) => sum + Number(i.invested_amount), 0);

  // Goals stats
  const activeGoals = goals.filter((g) => g.status === 'active').length;
  const completedGoals = goals.filter((g) => g.status === 'completed').length;

  // Expense by category for pie chart
  const expensePieData = useMemo(() => {
    const groups: Record<string, number> = {};
    expenses.forEach((e) => {
      groups[e.category] = (groups[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(groups).map(([key, value]) => ({
      name: EXPENSE_CATEGORIES[key as ExpenseCategory]?.label || key,
      value,
      color: EXPENSE_CATEGORIES[key as ExpenseCategory]?.color || '#64748B',
    }));
  }, [expenses]);

  // Weekly study data
  const weeklyStudyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map((day) => ({ name: day, minutes: 0 }));
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    studySessions.filter((s) => new Date(s.started_at) >= weekAgo).forEach((s) => {
      const dayIndex = new Date(s.started_at).getDay();
      data[dayIndex].minutes += s.duration_minutes;
    });
    return data;
  }, [studySessions]);

  // Monthly expenses trend
  const monthlyExpenseData = useMemo(() => {
    const months: Record<string, number> = {};
    expenses.forEach((e) => {
      const month = new Date(e.expense_date).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      months[month] = (months[month] || 0) + Number(e.amount);
    });
    return Object.entries(months).slice(-6).map(([name, amount]) => ({ name, amount }));
  }, [expenses]);

  return (
    <>
      <TopBar title="Statistics" subtitle="Your productivity overview" />

      <div className="page">
        {/* Overview Cards */}
        <div className="grid grid-3 mb-6 animate-fadeInUp">
          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <CheckSquare size={20} />
              </div>
              <span className="stat-card-value">{completedTasks}/{totalTasks}</span>
              <span className="stat-card-label">Tasks Completed</span>
            </div>
          </div>

          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                <Clock size={20} />
              </div>
              <span className="stat-card-value">{formatDuration(totalStudyMinutes)}</span>
              <span className="stat-card-label">Study Hours</span>
            </div>
          </div>

          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
                <Wallet size={20} />
              </div>
              <span className="stat-card-value">{formatCurrency(totalExpenses)}</span>
              <span className="stat-card-label">Total Expenses</span>
            </div>
          </div>

          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
                <TrendingUp size={20} />
              </div>
              <span className="stat-card-value">{formatCurrency(totalInvested)}</span>
              <span className="stat-card-label">Investments</span>
            </div>
          </div>

          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                <Target size={20} />
              </div>
              <span className="stat-card-value">{activeGoals} / {completedGoals}</span>
              <span className="stat-card-label">Active / Done Goals</span>
            </div>
          </div>

          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}>
                <Lightbulb size={20} />
              </div>
              <span className="stat-card-value">{ideas.length}</span>
              <span className="stat-card-label">Ideas Captured</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-2 gap-4 mb-6">
          {/* Weekly Study Chart */}
          <div className="card animate-fadeInUp stagger-2">
            <h3 className="text-sm font-semibold mb-4">Weekly Study Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyStudyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="minutes" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Breakdown */}
          <div className="card animate-fadeInUp stagger-3">
            <h3 className="text-sm font-semibold mb-4">Expense Breakdown</h3>
            {expensePieData.length === 0 ? (
              <div className="text-sm text-muted text-center" style={{ paddingTop: 60 }}>No expense data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Expense Trend */}
        {monthlyExpenseData.length > 1 && (
          <div className="card animate-fadeInUp stagger-4 mb-6">
            <h3 className="text-sm font-semibold mb-4">Monthly Expense Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Line type="monotone" dataKey="amount" stroke="#EC4899" strokeWidth={2} dot={{ fill: '#EC4899', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  );
}
