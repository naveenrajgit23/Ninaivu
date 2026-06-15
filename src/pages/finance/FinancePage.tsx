// ============================================================
// நினைவு (Ninaivu) — Finance Page
// ============================================================

import { useState, useMemo } from 'react';
import { Plus, Trash2, DollarSign, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { EXPENSE_CATEGORIES, INVESTMENT_TYPES } from '../../utils/constants';
import type { ExpenseCategory, MoneyStatus, InvestmentType } from '../../types';

export default function FinancePage() {
  const { expenses, moneyTracker, investments, addItem, updateItem, deleteItem } = useData();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'expenses' | 'money' | 'investments'>('expenses');

  // Expense form
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ amount: '', category: 'food' as ExpenseCategory, description: '', expense_date: new Date().toISOString().split('T')[0] });

  // Money form
  const [showMoneyForm, setShowMoneyForm] = useState(false);
  const [moneyForm, setMoneyForm] = useState({ person_name: '', amount: '', given_date: new Date().toISOString().split('T')[0], due_date: '', status: 'pending' as MoneyStatus, notes: '' });

  // Investment form
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [investForm, setInvestForm] = useState({ name: '', type: 'sip' as InvestmentType, invested_amount: '', current_value: '', notes: '' });

  // Stats
  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter((e) => {
      const d = new Date(e.expense_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  const totalPending = moneyTracker.filter((m) => m.status === 'pending').reduce((sum, m) => sum + Number(m.amount), 0);
  const totalInvested = investments.reduce((sum, i) => sum + Number(i.invested_amount), 0);

  // Category breakdown
  const expensesByCategory = useMemo(() => {
    const breakdown: Record<string, number> = {};
    const now = new Date();
    expenses.filter((e) => {
      const d = new Date(e.expense_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).forEach((e) => {
      breakdown[e.category] = (breakdown[e.category] || 0) + Number(e.amount);
    });
    return breakdown;
  }, [expenses]);

  const handleAddExpense = async () => {
    if (!expenseForm.amount) return;
    await addItem('expenses', { ...expenseForm, amount: parseFloat(expenseForm.amount) });
    setExpenseForm({ amount: '', category: 'food', description: '', expense_date: new Date().toISOString().split('T')[0] });
    setShowExpenseForm(false);
    showToast('Expense added!', 'success');
  };

  const handleAddMoney = async () => {
    if (!moneyForm.person_name.trim() || !moneyForm.amount) return;
    await addItem('moneyTracker', {
      ...moneyForm,
      amount: parseFloat(moneyForm.amount),
      due_date: moneyForm.due_date || null,
    });
    setMoneyForm({ person_name: '', amount: '', given_date: new Date().toISOString().split('T')[0], due_date: '', status: 'pending', notes: '' });
    setShowMoneyForm(false);
    showToast('Record added!', 'success');
  };

  const handleAddInvestment = async () => {
    if (!investForm.name.trim() || !investForm.invested_amount) return;
    await addItem('investments', {
      ...investForm,
      invested_amount: parseFloat(investForm.invested_amount),
      current_value: investForm.current_value ? parseFloat(investForm.current_value) : null,
    });
    setInvestForm({ name: '', type: 'sip', invested_amount: '', current_value: '', notes: '' });
    setShowInvestmentForm(false);
    showToast('Investment added!', 'success');
  };

  return (
    <>
      <TopBar title="Finance" subtitle="Track your money" />

      <div className="page">
        {/* Overview Stats */}
        <div className="grid grid-3 mb-6 animate-fadeInUp">
          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
                <ArrowDownRight size={20} />
              </div>
              <span className="stat-card-value">{formatCurrency(thisMonthExpenses)}</span>
              <span className="stat-card-label">This Month</span>
            </div>
          </div>
          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                <Users size={20} />
              </div>
              <span className="stat-card-value">{formatCurrency(totalPending)}</span>
              <span className="stat-card-label">Money Lent</span>
            </div>
          </div>
          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                <TrendingUp size={20} />
              </div>
              <span className="stat-card-value">{formatCurrency(totalInvested)}</span>
              <span className="stat-card-label">Invested</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs mb-6">
          {([['expenses', 'Expenses'], ['money', 'Money Tracker'], ['investments', 'Investments']] as const).map(([key, label]) => (
            <button key={key} className={`tab ${activeTab === key ? 'tab-active' : ''}`} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <>
            {/* Category breakdown */}
            {Object.keys(expensesByCategory).length > 0 && (
              <div className="card mb-4">
                <h3 className="text-sm font-semibold mb-3">This Month by Category</h3>
                <div className="flex flex-col gap-2">
                  {Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
                    const cfg = EXPENSE_CATEGORIES[cat as ExpenseCategory];
                    const pct = thisMonthExpenses > 0 ? (amount / thisMonthExpenses) * 100 : 0;
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-xs" style={{ minWidth: 70, color: cfg?.color }}>{cfg?.label || cat}</span>
                        <div className="progress flex-1"><div className="progress-bar" style={{ width: `${pct}%`, background: cfg?.color }} /></div>
                        <span className="text-xs font-semibold" style={{ minWidth: 70, textAlign: 'right' }}>{formatCurrency(amount)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {expenses.length === 0 ? (
              <EmptyState icon={<DollarSign size={32} />} title="No expenses yet" description="Start tracking your expenses." action={<button className="btn btn-primary" onClick={() => setShowExpenseForm(true)}>Add Expense</button>} />
            ) : (
              <div className="flex flex-col gap-2">
                {expenses.map((exp) => {
                  const cfg = EXPENSE_CATEGORIES[exp.category];
                  return (
                    <div key={exp.id} className="card card-interactive animate-fadeInUp" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div className="flex items-center gap-3">
                        <div className="stat-card-icon" style={{ width: 36, height: 36, background: `${cfg?.color}18`, color: cfg?.color }}>
                          <DollarSign size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="list-item-title">{exp.description || cfg?.label}</div>
                          <div className="text-xs text-muted">{formatDate(exp.expense_date)}</div>
                        </div>
                        <span className="font-semibold text-sm" style={{ color: 'var(--color-error)' }}>-{formatCurrency(Number(exp.amount))}</span>
                        <button className="btn btn-icon btn-ghost" onClick={() => { deleteItem('expenses', exp.id); showToast('Expense deleted', 'info'); }} style={{ padding: 4 }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button className="fab" onClick={() => setShowExpenseForm(true)} id="fab-add-expense"><Plus size={24} /></button>
          </>
        )}

        {/* Money Tracker Tab */}
        {activeTab === 'money' && (
          <>
            {moneyTracker.length === 0 ? (
              <EmptyState icon={<Users size={32} />} title="No records yet" description="Track money given to people." action={<button className="btn btn-primary" onClick={() => setShowMoneyForm(true)}>Add Record</button>} />
            ) : (
              <div className="flex flex-col gap-2">
                {moneyTracker.map((m) => (
                  <div key={m.id} className="card card-interactive animate-fadeInUp" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div className="flex items-center gap-3">
                      <div className="avatar avatar-sm">{m.person_name[0]?.toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="list-item-title">{m.person_name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">{formatDate(m.given_date)}</span>
                          {m.due_date && <span className="text-xs text-muted">→ {formatDate(m.due_date)}</span>}
                        </div>
                      </div>
                      <span className="font-semibold text-sm">{formatCurrency(Number(m.amount))}</span>
                      <span className={`badge ${m.status === 'pending' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '10px' }}>{m.status}</span>
                      <div className="flex items-center gap-1">
                        {m.status === 'pending' && (
                          <button className="btn btn-sm btn-ghost" onClick={() => { updateItem('moneyTracker', m.id, { status: 'returned' }); showToast('Marked as returned', 'success'); }}>
                            ✓
                          </button>
                        )}
                        <button className="btn btn-icon btn-ghost" onClick={() => { deleteItem('moneyTracker', m.id); showToast('Record deleted', 'info'); }} style={{ padding: 4 }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="fab" onClick={() => setShowMoneyForm(true)} id="fab-add-money"><Plus size={24} /></button>
          </>
        )}

        {/* Investments Tab */}
        {activeTab === 'investments' && (
          <>
            {/* Portfolio breakdown */}
            {investments.length > 0 && (
              <div className="card mb-4">
                <h3 className="text-sm font-semibold mb-2">Portfolio Summary</h3>
                <div className="stat-card-value mb-2">{formatCurrency(totalInvested)}</div>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(
                    investments.reduce((acc, i) => { acc[i.type] = (acc[i.type] || 0) + Number(i.invested_amount); return acc; }, {} as Record<string, number>)
                  ).map(([type, amount]) => {
                    const cfg = INVESTMENT_TYPES[type as InvestmentType];
                    return (
                      <div key={type} className="chip" style={{ background: `${cfg?.color}18`, color: cfg?.color, borderColor: `${cfg?.color}40` }}>
                        {cfg?.label}: {formatCurrency(amount)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {investments.length === 0 ? (
              <EmptyState icon={<TrendingUp size={32} />} title="No investments yet" description="Track your investment portfolio." action={<button className="btn btn-primary" onClick={() => setShowInvestmentForm(true)}>Add Investment</button>} />
            ) : (
              <div className="flex flex-col gap-2">
                {investments.map((inv) => {
                  const cfg = INVESTMENT_TYPES[inv.type];
                  return (
                    <div key={inv.id} className="card card-interactive animate-fadeInUp" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div className="flex items-center gap-3">
                        <div className="stat-card-icon" style={{ width: 36, height: 36, background: `${cfg?.color}18`, color: cfg?.color }}>
                          <ArrowUpRight size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="list-item-title">{inv.name}</div>
                          <span className="badge" style={{ background: `${cfg?.color}18`, color: cfg?.color, fontSize: '10px' }}>{cfg?.label}</span>
                        </div>
                        <span className="font-semibold text-sm">{formatCurrency(Number(inv.invested_amount))}</span>
                        <button className="btn btn-icon btn-ghost" onClick={() => { deleteItem('investments', inv.id); showToast('Investment deleted', 'info'); }} style={{ padding: 4 }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button className="fab" onClick={() => setShowInvestmentForm(true)} id="fab-add-investment"><Plus size={24} /></button>
          </>
        )}
      </div>

      {/* Expense Modal */}
      <Modal isOpen={showExpenseForm} onClose={() => setShowExpenseForm(false)} title="Add Expense"
        footer={<><button className="btn btn-secondary" onClick={() => setShowExpenseForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddExpense}>Add</button></>}>
        <div className="input-group"><label className="input-label">Amount (₹)</label><input className="input" type="number" placeholder="0.00" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} autoFocus id="expense-amount" /></div>
        <div className="input-group"><label className="input-label">Category</label><select className="input select" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })} id="expense-category">{Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
        <div className="input-group"><label className="input-label">Description</label><input className="input" placeholder="What was it for?" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} id="expense-desc" /></div>
        <div className="input-group"><label className="input-label">Date</label><input className="input" type="date" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} id="expense-date" /></div>
      </Modal>

      {/* Money Modal */}
      <Modal isOpen={showMoneyForm} onClose={() => setShowMoneyForm(false)} title="Add Money Record"
        footer={<><button className="btn btn-secondary" onClick={() => setShowMoneyForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddMoney}>Add</button></>}>
        <div className="input-group"><label className="input-label">Person Name</label><input className="input" placeholder="Name" value={moneyForm.person_name} onChange={(e) => setMoneyForm({ ...moneyForm, person_name: e.target.value })} autoFocus id="money-name" /></div>
        <div className="input-group"><label className="input-label">Amount (₹)</label><input className="input" type="number" placeholder="0.00" value={moneyForm.amount} onChange={(e) => setMoneyForm({ ...moneyForm, amount: e.target.value })} id="money-amount" /></div>
        <div className="grid grid-2 gap-3">
          <div className="input-group"><label className="input-label">Given Date</label><input className="input" type="date" value={moneyForm.given_date} onChange={(e) => setMoneyForm({ ...moneyForm, given_date: e.target.value })} id="money-given" /></div>
          <div className="input-group"><label className="input-label">Due Date</label><input className="input" type="date" value={moneyForm.due_date} onChange={(e) => setMoneyForm({ ...moneyForm, due_date: e.target.value })} id="money-due" /></div>
        </div>
        <div className="input-group"><label className="input-label">Notes</label><input className="input" placeholder="Optional notes" value={moneyForm.notes} onChange={(e) => setMoneyForm({ ...moneyForm, notes: e.target.value })} id="money-notes" /></div>
      </Modal>

      {/* Investment Modal */}
      <Modal isOpen={showInvestmentForm} onClose={() => setShowInvestmentForm(false)} title="Add Investment"
        footer={<><button className="btn btn-secondary" onClick={() => setShowInvestmentForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddInvestment}>Add</button></>}>
        <div className="input-group"><label className="input-label">Investment Name</label><input className="input" placeholder="e.g., HDFC Index Fund" value={investForm.name} onChange={(e) => setInvestForm({ ...investForm, name: e.target.value })} autoFocus id="invest-name" /></div>
        <div className="input-group"><label className="input-label">Type</label><select className="input select" value={investForm.type} onChange={(e) => setInvestForm({ ...investForm, type: e.target.value as InvestmentType })} id="invest-type">{Object.entries(INVESTMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
        <div className="grid grid-2 gap-3">
          <div className="input-group"><label className="input-label">Invested Amount (₹)</label><input className="input" type="number" placeholder="0.00" value={investForm.invested_amount} onChange={(e) => setInvestForm({ ...investForm, invested_amount: e.target.value })} id="invest-amount" /></div>
          <div className="input-group"><label className="input-label">Current Value (₹)</label><input className="input" type="number" placeholder="Optional" value={investForm.current_value} onChange={(e) => setInvestForm({ ...investForm, current_value: e.target.value })} id="invest-current" /></div>
        </div>
        <div className="input-group"><label className="input-label">Notes</label><input className="input" placeholder="Optional notes" value={investForm.notes} onChange={(e) => setInvestForm({ ...investForm, notes: e.target.value })} id="invest-notes" /></div>
      </Modal>
    </>
  );
}
