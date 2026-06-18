// ============================================================
// நினைவு (Ninaivu) — Finance Page
// ============================================================

import { useState, useMemo } from 'react';
import { Plus, ArrowDownRight, Users, TrendingUp, MoreHorizontal, Sprout, Trash2 } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { EXPENSE_CATEGORIES, INVESTMENT_TYPES } from '../../utils/constants';
import ProgressRing from '../../components/ui/ProgressRing';
import type { ExpenseCategory, MoneyStatus, InvestmentType } from '../../types';

export default function FinancePage() {
  const { expenses, moneyTracker, investments, addItem, deleteItem, updateItem } = useData();
  const { showToast } = useToast();

  // Budget state synced with LocalStorage
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('ninaivu-budget');
    return saved ? parseFloat(saved) : 1000;
  });

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

  const handleSetBudget = () => {
    const val = window.prompt("Enter your monthly budget (₹):", budget.toString());
    if (val !== null) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed > 0) {
        setBudget(parsed);
        localStorage.setItem('ninaivu-budget', parsed.toString());
        showToast('Budget updated successfully!', 'success');
      } else {
        showToast('Please enter a valid amount', 'error');
      }
    }
  };

  const spentPct = budget > 0 ? Math.min(100, Math.round((thisMonthExpenses / budget) * 100)) : 0;
  const isOverBudget = thisMonthExpenses > budget;
  const budgetProgress = isOverBudget ? 100 : spentPct;

  // Category breakdown calculation
  const categoryStats = useMemo(() => {
    const now = new Date();
    const currentMonthExpenses = expenses.filter((e) => {
      const d = new Date(e.expense_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const total = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    let foodSum = 0;
    let travelSum = 0;
    let shoppingSum = 0;
    let otherSum = 0;

    currentMonthExpenses.forEach((e) => {
      if (e.category === 'food') foodSum += Number(e.amount);
      else if (e.category === 'travel') travelSum += Number(e.amount);
      else if (e.category === 'shopping') shoppingSum += Number(e.amount);
      else otherSum += Number(e.amount);
    });

    const foodPct = total > 0 ? Math.round((foodSum / total) * 100) : 0;
    const travelPct = total > 0 ? Math.round((travelSum / total) * 100) : 0;
    const shoppingPct = total > 0 ? Math.round((shoppingSum / total) * 100) : 0;
    const otherPct = total > 0 ? Math.round((otherSum / total) * 100) : 0;

    return {
      food: { amount: foodSum, pct: foodPct },
      travel: { amount: travelSum, pct: travelPct },
      shopping: { amount: shoppingSum, pct: shoppingPct },
      other: { amount: otherSum, pct: otherPct },
    };
  }, [expenses]);

  const handleAddExpense = async () => {
    if (!expenseForm.amount) return;
    await addItem('expenses', { ...expenseForm, amount: parseFloat(expenseForm.amount) });
    setExpenseForm({ amount: '', category: 'food', description: '', expense_date: new Date().toISOString().split('T')[0] });
    setShowExpenseForm(false);
    showToast('Expense added!', 'success');
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Delete this expense?')) {
      await deleteItem('expenses', id);
      showToast('Expense deleted', 'success');
    }
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
      <TopBar title="Finance" subtitle="Track your money, build your future." />

      <div className="page">
        {/* Overview Stats */}
        <div className="grid grid-3 mb-6 animate-fadeInUp">
          <div className="card" style={{ padding: 'var(--space-4)', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
            <div className="flex justify-between items-start mb-2">
              <div className="stat-card-icon" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', width: 40, height: 40 }}>
                <ArrowDownRight size={20} />
              </div>
            </div>
            <div className="text-xs font-medium text-secondary mb-1">Spent This Month</div>
            <div className="text-2xl font-bold">{formatCurrency(thisMonthExpenses)}</div>
            <div className="text-xs text-muted mt-1">Track monthly spending</div>
            <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 30 }} viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,15 Q25,30 50,15 T100,15 L100,30 L0,30 Z" fill="none" stroke="var(--color-error-light)" strokeWidth="2" />
              <path d="M0,15 Q25,30 50,15 T100,15 L100,30 L0,30 Z" fill="var(--color-error)" opacity="0.05" stroke="none" />
            </svg>
          </div>
          
          <div className="card" style={{ padding: 'var(--space-4)', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
            <div className="flex justify-between items-start mb-2">
              <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)', width: 40, height: 40 }}>
                <Users size={20} />
              </div>
              <div className="badge" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)', fontSize: '10px' }}>Pending</div>
            </div>
            <div className="text-xs font-medium text-secondary mb-1">Money Lent</div>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <div className="text-xs text-muted mt-1">
              {moneyTracker.filter((m) => m.status === 'pending').length} {moneyTracker.filter((m) => m.status === 'pending').length === 1 ? 'person' : 'people'}
            </div>
            <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 30 }} viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,15 Q25,0 50,15 T100,15 L100,30 L0,30 Z" fill="none" stroke="var(--color-warning-light)" strokeWidth="2" />
              <path d="M0,15 Q25,0 50,15 T100,15 L100,30 L0,30 Z" fill="var(--color-warning)" opacity="0.05" stroke="none" />
            </svg>
          </div>

          <div className="card" style={{ padding: 'var(--space-4)', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
            <div className="flex justify-between items-start mb-2">
              <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', width: 40, height: 40 }}>
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="text-xs font-medium text-secondary mb-1">Invested</div>
            <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
            <div className="text-xs text-muted mt-1">Track mutual funds & SIPs</div>
            <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 30 }} viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,15 Q25,30 50,15 T100,15 L100,30 L0,30 Z" fill="none" stroke="var(--color-success-light)" strokeWidth="2" />
              <path d="M0,15 Q25,30 50,15 T100,15 L100,30 L0,30 Z" fill="var(--color-success)" opacity="0.05" stroke="none" />
            </svg>
          </div>
        </div>

        <div className="page-layout-split mb-6">
          {/* Main Area: Charts & Categories */}
          <div className="flex flex-col gap-6">
            <div className="card animate-fadeInUp stagger-1" style={{ position: 'relative', paddingBottom: 'var(--space-6)' }}>
              <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <h3 className="font-bold text-base">Money Overview</h3>
                <div className="flex items-center gap-2">
                  <select className="input select" style={{ background: 'transparent', padding: '4px 24px 4px 8px', minHeight: 32, fontSize: '12px' }}>
                    <option>This Month</option>
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowExpenseForm(true)}>
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
                <span className="text-sm text-secondary">Total Spent <strong className="text-primary">{formatCurrency(thisMonthExpenses)}</strong></span>
              </div>
              
              {/* Mock Line Chart Area */}
              <div style={{ height: '200px', width: '100%', position: 'relative', borderBottom: '1px solid var(--border-color)', borderLeft: '1px solid var(--border-color)', marginBottom: 'var(--space-6)' }}>
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,80 Q10,70 20,60 T40,40 T60,60 T80,40 T100,60 L100,100 L0,100 Z" fill="var(--color-success)" opacity="0.1" />
                  <path d="M0,80 Q10,70 20,60 T40,40 T60,60 T80,40 T100,60" fill="none" stroke="var(--color-success)" strokeWidth="1.5" />
                </svg>
                {/* Y-axis labels */}
                <div style={{ position: 'absolute', left: '-25px', top: '0%', fontSize: '10px', color: 'var(--text-muted)' }}>₹150</div>
                <div style={{ position: 'absolute', left: '-25px', top: '33%', fontSize: '10px', color: 'var(--text-muted)' }}>₹100</div>
                <div style={{ position: 'absolute', left: '-20px', top: '66%', fontSize: '10px', color: 'var(--text-muted)' }}>₹50</div>
                <div style={{ position: 'absolute', left: '-15px', bottom: '0px', fontSize: '10px', color: 'var(--text-muted)' }}>₹0</div>
                {/* X-axis labels */}
                <div style={{ position: 'absolute', left: '0%', bottom: '-20px', fontSize: '10px', color: 'var(--text-muted)' }}>Jun 1</div>
                <div style={{ position: 'absolute', left: '20%', bottom: '-20px', fontSize: '10px', color: 'var(--text-muted)' }}>Jun 6</div>
                <div style={{ position: 'absolute', left: '40%', bottom: '-20px', fontSize: '10px', color: 'var(--text-muted)' }}>Jun 11</div>
                <div style={{ position: 'absolute', left: '60%', bottom: '-20px', fontSize: '10px', color: 'var(--text-muted)' }}>Jun 16</div>
                <div style={{ position: 'absolute', left: '80%', bottom: '-20px', fontSize: '10px', color: 'var(--text-muted)' }}>Jun 26</div>
                <div style={{ position: 'absolute', right: '0%', bottom: '-20px', fontSize: '10px', color: 'var(--text-muted)' }}>Jun 30</div>
              </div>

              {/* Category Breakdown dynamically mapped to current month expenses */}
              <div className="grid grid-4 gap-4 mt-8">
                <div className="card" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '12px', border: 'none', boxShadow: 'none' }}>
                  <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', width: 32, height: 32 }}>🍽</div>
                  <div>
                    <div className="text-xs font-medium">Food</div>
                    <div className="text-sm font-bold">₹{categoryStats.food.amount} <span className="text-[10px] text-muted font-normal">{categoryStats.food.pct}%</span></div>
                  </div>
                </div>
                <div className="card" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '12px', border: 'none', boxShadow: 'none' }}>
                  <div className="stat-card-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)', width: 32, height: 32 }}>🚌</div>
                  <div>
                    <div className="text-xs font-medium">Transport</div>
                    <div className="text-sm font-bold">₹{categoryStats.travel.amount} <span className="text-[10px] text-muted font-normal">{categoryStats.travel.pct}%</span></div>
                  </div>
                </div>
                <div className="card" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '12px', border: 'none', boxShadow: 'none' }}>
                  <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', width: 32, height: 32 }}>🛍</div>
                  <div>
                    <div className="text-xs font-medium">Shopping</div>
                    <div className="text-sm font-bold">₹{categoryStats.shopping.amount} <span className="text-[10px] text-muted font-normal">{categoryStats.shopping.pct}%</span></div>
                  </div>
                </div>
                <div className="card" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '12px', border: 'none', boxShadow: 'none' }}>
                  <div className="stat-card-icon" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', width: 32, height: 32 }}><MoreHorizontal size={14} /></div>
                  <div>
                    <div className="text-xs font-medium">Other</div>
                    <div className="text-sm font-bold">₹{categoryStats.other.amount} <span className="text-[10px] text-muted font-normal">{categoryStats.other.pct}%</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <h4 className="font-bold text-sm mb-4">Expense History</h4>
                {expenses.length === 0 ? (
                  <p className="text-sm text-muted">No expenses yet.</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                    {expenses.map((expense) => {
                      const cat = EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES['other'];
                      const iconMap: Record<string, string> = {
                        food: '🍽', travel: '✈️', education: '📚', shopping: '🛍', entertainment: '🍿', health: '💊', bills: '🧾', other: '💼'
                      };
                      return (
                        <div key={expense.id} className="card flex items-center justify-between p-3 shadow-none border border-border-subtle" style={{ padding: 'var(--space-3)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                          <div className="flex items-center gap-3">
                            <div className="stat-card-icon" style={{ background: `${cat.color}18`, color: cat.color, width: 32, height: 32, fontSize: '16px' }}>
                              {iconMap[expense.category] || '💸'}
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{expense.description || cat.label}</div>
                              <div className="text-xs text-muted">{formatDate(expense.expense_date)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="font-bold">₹{expense.amount}</div>
                            <button className="btn btn-icon btn-ghost text-muted" onClick={() => handleDeleteExpense(expense.id)} style={{ padding: 4 }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Area: Lent & Budget */}
          <div className="flex flex-col gap-6">
            <div className="card animate-fadeInUp stagger-2">
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <h3 className="font-bold text-sm">People You've Lent Money To</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowMoneyForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Lent
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {moneyTracker.length === 0 ? (
                  <p className="text-xs text-muted">No money lent records yet.</p>
                ) : (
                  moneyTracker.map((record) => (
                    <div key={record.id} className="card" style={{ border: '1px solid var(--border-color)', boxShadow: 'none', padding: 'var(--space-3)' }}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            {record.person_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold">{record.person_name}</div>
                            <div className="text-xs text-secondary">Lent on {formatDate(record.given_date)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right flex flex-col items-end">
                            <div className="font-bold text-sm">₹{record.amount}</div>
                            <span 
                              onClick={async () => {
                                const newStatus = record.status === 'pending' ? 'paid' : 'pending';
                                await updateItem('moneyTracker', record.id, { status: newStatus });
                                showToast(`Marked as ${newStatus}`, 'success');
                              }}
                              className="badge" 
                              style={{ 
                                background: record.status === 'pending' ? 'rgba(255, 140, 0, 0.1)' : 'var(--color-success-light)', 
                                color: record.status === 'pending' ? '#FF8C00' : 'var(--color-success)', 
                                fontSize: '9px', 
                                marginTop: 4,
                                cursor: 'pointer'
                              }}
                            >
                              {record.status === 'pending' ? 'Pending' : 'Returned'}
                            </span>
                          </div>
                          <button className="btn btn-icon btn-ghost text-muted" onClick={async () => {
                            if (window.confirm('Delete this record?')) {
                              await deleteItem('moneyTracker', record.id);
                              showToast('Record deleted', 'success');
                            }
                          }} style={{ padding: 4 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card animate-fadeInUp stagger-2">
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <h3 className="font-bold text-sm">Investments</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowInvestmentForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Invested
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {investments.length === 0 ? (
                  <p className="text-xs text-muted">No investments recorded yet.</p>
                ) : (
                  investments.map((invest) => (
                    <div key={invest.id} className="card" style={{ border: '1px solid var(--border-color)', boxShadow: 'none', padding: 'var(--space-3)' }}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold">{invest.name}</div>
                          <div className="text-xs text-secondary">{INVESTMENT_TYPES[invest.type]?.label || invest.type}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold text-sm">₹{invest.invested_amount}</div>
                            {invest.current_value && (
                              <div className="text-xs text-success" style={{ fontWeight: '500' }}>
                                Val: ₹{invest.current_value}
                              </div>
                            )}
                          </div>
                          <button className="btn btn-icon btn-ghost text-muted" onClick={async () => {
                            if (window.confirm('Delete this investment?')) {
                              await deleteItem('investments', invest.id);
                              showToast('Investment deleted', 'success');
                            }
                          }} style={{ padding: 4 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card animate-fadeInUp stagger-3">
              <h3 className="font-bold text-sm mb-6">Budget Status</h3>
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <ProgressRing progress={budgetProgress} size={90} strokeWidth={8} color={isOverBudget ? "var(--color-error)" : "var(--color-success)"}>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold">{spentPct}%</span>
                    <span className="text-[9px] font-bold text-muted" style={{ color: isOverBudget ? 'var(--color-error)' : 'inherit' }}>
                      {isOverBudget ? 'Over Limit' : 'On Track'}
                    </span>
                  </div>
                </ProgressRing>
                <div>
                  <p className="text-xs text-secondary mb-4">
                    {isOverBudget ? "You have exceeded your monthly budget!" : "Great job! You're within your monthly budget."}
                  </p>
                  <div className="flex gap-4">
                    <div>
                      <div className="text-xs text-muted mb-1">Spent</div>
                      <div className="font-bold text-sm">{formatCurrency(thisMonthExpenses)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted mb-1">Budget</div>
                      <div className="font-bold text-sm">{formatCurrency(budget)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={handleSetBudget} className="btn w-full" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', fontWeight: 'bold' }}>
                <Plus size={16} /> Set Budget
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Expense Modal */}
      <Modal isOpen={showExpenseForm} onClose={() => setShowExpenseForm(false)} title="Add Expense"
        footer={<><button className="btn btn-secondary" onClick={() => setShowExpenseForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddExpense}>Add</button></>}>
        <div className="input-group"><label className="input-label">Amount (₹)</label><input className="input" type="number" placeholder="0.00" min="0.01" step="0.01" max="99999999" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} autoFocus id="expense-amount" /></div>
        <div className="input-group"><label className="input-label">Category</label><select className="input select" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })} id="expense-category">{Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
        <div className="input-group"><label className="input-label">Description</label><input className="input" placeholder="What was it for?" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} maxLength={200} id="expense-desc" /></div>
        <div className="input-group"><label className="input-label">Date</label><input className="input" type="date" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} id="expense-date" /></div>
      </Modal>

      {/* Money Modal */}
      <Modal isOpen={showMoneyForm} onClose={() => setShowMoneyForm(false)} title="Add Money Record"
        footer={<><button className="btn btn-secondary" onClick={() => setShowMoneyForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddMoney}>Add</button></>}>
        <div className="input-group"><label className="input-label">Person Name</label><input className="input" placeholder="Name" value={moneyForm.person_name} onChange={(e) => setMoneyForm({ ...moneyForm, person_name: e.target.value })} autoFocus maxLength={100} id="money-name" /></div>
        <div className="input-group"><label className="input-label">Amount (₹)</label><input className="input" type="number" placeholder="0.00" min="0.01" step="0.01" max="99999999" value={moneyForm.amount} onChange={(e) => setMoneyForm({ ...moneyForm, amount: e.target.value })} id="money-amount" /></div>
        <div className="grid grid-2 gap-3">
          <div className="input-group"><label className="input-label">Given Date</label><input className="input" type="date" value={moneyForm.given_date} onChange={(e) => setMoneyForm({ ...moneyForm, given_date: e.target.value })} id="money-given" /></div>
          <div className="input-group"><label className="input-label">Due Date</label><input className="input" type="date" value={moneyForm.due_date} onChange={(e) => setMoneyForm({ ...moneyForm, due_date: e.target.value })} id="money-due" /></div>
        </div>
        <div className="input-group"><label className="input-label">Notes</label><input className="input" placeholder="Optional notes" value={moneyForm.notes} onChange={(e) => setMoneyForm({ ...moneyForm, notes: e.target.value })} maxLength={500} id="money-notes" /></div>
      </Modal>

      {/* Investment Modal */}
      <Modal isOpen={showInvestmentForm} onClose={() => setShowInvestmentForm(false)} title="Add Investment"
        footer={<><button className="btn btn-secondary" onClick={() => setShowInvestmentForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddInvestment}>Add</button></>}>
        <div className="input-group"><label className="input-label">Investment Name</label><input className="input" placeholder="e.g., HDFC Index Fund" value={investForm.name} onChange={(e) => setInvestForm({ ...investForm, name: e.target.value })} autoFocus maxLength={200} id="invest-name" /></div>
        <div className="input-group"><label className="input-label">Type</label><select className="input select" value={investForm.type} onChange={(e) => setInvestForm({ ...investForm, type: e.target.value as InvestmentType })} id="invest-type">{Object.entries(INVESTMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
        <div className="grid grid-2 gap-3">
          <div className="input-group"><label className="input-label">Invested Amount (₹)</label><input className="input" type="number" placeholder="0.00" min="0.01" step="0.01" max="99999999" value={investForm.invested_amount} onChange={(e) => setInvestForm({ ...investForm, invested_amount: e.target.value })} id="invest-amount" /></div>
          <div className="input-group"><label className="input-label">Current Value (₹)</label><input className="input" type="number" placeholder="Optional" value={investForm.current_value} onChange={(e) => setInvestForm({ ...investForm, current_value: e.target.value })} id="invest-current" /></div>
        </div>
        <div className="input-group"><label className="input-label">Notes</label><input className="input" placeholder="Optional notes" value={investForm.notes} onChange={(e) => setInvestForm({ ...investForm, notes: e.target.value })} maxLength={500} id="invest-notes" /></div>
      </Modal>
    </>
  );
}
