import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Wallet, Flame, ChevronRight, Circle, Check, Target
} from 'lucide-react';
import TaskCompletionModal from '../../components/ui/TaskCompletionModal';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { getGreeting, isToday } from '../../utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, goals, habits, habitCompletions, expenses, studySessions, updateItem, addItem, deleteItem } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Modal State
  const [completedTaskData, setCompletedTaskData] = useState<{name: string, completed: number, total: number, allDone: boolean} | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const greeting = getGreeting();
  // We want the format "Thursday, June 18, 2026"
  const dateStr = new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  // Derived Data
  const activeHabits = habits || [];
  const todaysCompletions = (habitCompletions || []).filter(c => c.completed_date === today);
  const completedHabitsCount = todaysCompletions.length;

  const todayTasksAll = tasks.filter(t => t.due_date && isToday(t.due_date));
  const todayCompletedTasks = todayTasksAll.filter(t => t.status === 'completed');
  const pendingTasks = todayTasksAll.filter(t => t.status !== 'completed').slice(0, 3);
  
  const activeGoals = goals.filter(g => g.status === 'active').slice(0, 2);
  
  const todayExpenses = (expenses || []).filter(e => isToday(e.expense_date)).reduce((sum, e) => sum + Number(e.amount), 0);
  const todayStudyTime = (studySessions || []).filter(s => s.started_at && isToday(s.started_at)).reduce((sum, s) => sum + s.duration_minutes, 0);

  const totalDailyItems = todayTasksAll.length + activeHabits.length;
  const totalCompletedItems = todayCompletedTasks.length + completedHabitsCount;
  const dailyProgressPct = totalDailyItems > 0 ? Math.round((totalCompletedItems / totalDailyItems) * 100) : 0;

  const todaysWins = [
    ...todayCompletedTasks.map(t => ({ id: t.id, title: t.title })),
    ...todaysCompletions.map(c => {
       const h = activeHabits.find(h => h.id === c.habit_id);
       return { id: c.id, title: h?.title || 'Habit' };
    })
  ];

  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (d: Date = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Dynamic habit streak calculation
  const calculateStreak = (habitId: string) => {
    const dates = (habitCompletions || [])
      .filter(c => c.habit_id === habitId)
      .map(c => c.completed_date)
      .sort((a, b) => b.localeCompare(a));
    
    if (dates.length === 0) return 0;
    
    let current = 0;
    const dateSet = new Set(dates);
    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);
    
    if (dateSet.has(getLocalDateString(checkDate))) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
      while(dateSet.has(getLocalDateString(checkDate))) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      while(dateSet.has(getLocalDateString(checkDate))) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    return current;
  };

  const bestOverallStreak = activeHabits.reduce((max, h) => {
    const s = calculateStreak(h.id);
    return s > max ? s : max;
  }, 0);

  // Handlers
  const handleTaskToggle = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateItem('tasks', id, { status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null });
    
    if (newStatus === 'completed') {
      const newCompletedCount = todayCompletedTasks.length + 1;
      setCompletedTaskData({
        name: task.title,
        completed: newCompletedCount,
        total: todayTasksAll.length,
        allDone: newCompletedCount === todayTasksAll.length && todayTasksAll.length > 0
      });
    }
  };

  const handleHabitToggle = async (habitId: string) => {
    const todayStr = getLocalDateString(new Date());
    const existing = (habitCompletions || []).find(c => c.habit_id === habitId && c.completed_date === todayStr);
    if (existing) {
      await deleteItem('habitCompletions', existing.id);
      showToast('Habit completion undone', 'info');
    } else {
      await addItem('habitCompletions', { habit_id: habitId, completed_date: todayStr });
      showToast('Habit marked complete! 🎉', 'success');
    }
  };



  return (
    <>
      <div className="page" style={{ paddingBottom: 'var(--space-12)' }}>
        
                {/* ── Minimal Hero Section ── */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div className="dashboard-header-wrapper" style={{ marginBottom: 'var(--space-4)' }}>
            <div>
              <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>
                {greeting}, {user?.full_name?.split(' ')[0] || 'User'} <span style={{color: '#F59E0B'}}>☀️</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)' }}>{dateStr}</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-secondary)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: 'var(--space-6) 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-primary)', lineHeight: 1 }}>
                {dailyProgressPct}% Complete
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--text-primary)' }}>
                <span>🔥</span> {todaysWins.length} win{todaysWins.length !== 1 && 's'} today
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--color-primary)' }}>✓</span> {todayCompletedTasks.length} task{todayCompletedTasks.length !== 1 && 's'} completed
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--text-primary)' }}>
                <span>🎯</span> {activeHabits.length} active habit{activeHabits.length !== 1 && 's'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--text-primary)' }}>
                <span>📖</span> {Math.floor(todayStudyTime / 60)}h {todayStudyTime % 60}m study
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', fontStyle: 'italic', marginTop: 'var(--space-2)' }}>
              Small wins build momentum.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: 'var(--space-6) 0 var(--space-8)' }} />
        </div>
        <div className="dashboard-main-grid">
          {/* Today's Wins */}
          <div className="card animate-fadeInUp flex-col-card stagger-1" style={{ position: 'relative' }}>
             <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'bold', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏆 Today's Wins
             </h2>
             <span style={{ position: 'absolute', top: 'var(--space-5)', right: 'var(--space-5)', background: 'var(--color-success-light)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '12px', fontSize: 'var(--font-size-xs)', fontWeight: 'bold' }}>
               {todaysWins.length}
             </span>
             <div style={{ flex: 1 }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                 {todaysWins.slice(0, 3).map((win, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                     <div style={{ background: 'var(--color-success)', borderRadius: '50%', padding: '2px', color: 'white' }}>
                       <Check size={14} />
                     </div>
                     <span>{win.title}</span>
                   </div>
                 ))}
                 {todaysWins.length === 0 && <p style={{color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)'}}>Complete tasks to see wins here.</p>}
               </div>
             </div>
             <div style={{ fontWeight: '500', color: 'var(--color-success)', background: 'var(--color-success-light)', padding: 'var(--space-3)', margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)', marginTop: 'auto' }}>
               {todaysWins.length} wins today 🎉
             </div>
          </div>

          {/* Today's Tasks */}
          <div className="card animate-fadeInUp flex-col-card stagger-2" style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'bold', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={18} color="var(--color-primary)" /> Today's Tasks
            </h2>
            <span style={{ position: 'absolute', top: 'var(--space-5)', right: 'var(--space-5)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '12px', fontSize: 'var(--font-size-xs)', fontWeight: 'bold' }}>
              {todayTasksAll.length}
            </span>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {todayTasksAll.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', padding: 'var(--space-2) 0', fontSize: 'var(--font-size-sm)' }}>No tasks scheduled for today.</p>
              ) : pendingTasks.length > 0 ? pendingTasks.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => handleTaskToggle(t.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <Circle size={20} color="var(--text-muted)" />
                    </button>
                    <span style={{ fontSize: 'var(--font-size-sm)' }}>{t.title}</span>
                  </div>
                  {t.priority === 'medium' && <span style={{ background: 'rgba(255, 140, 0, 0.1)', color: '#FF8C00', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>MEDIUM</span>}
                  {t.priority === 'low' && <span style={{ background: 'var(--color-info-light)', color: 'var(--color-info)', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>LOW</span>}
                  {t.priority === 'high' && <span style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>HIGH</span>}
                </div>
              )) : (
                <p style={{ color: 'var(--text-secondary)', padding: 'var(--space-2) 0', fontSize: 'var(--font-size-sm)' }}>All tasks completed! 🎉</p>
              )}
            </div>
            
            <button 
              onClick={() => navigate('/tasks')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--color-primary)', fontWeight: '600', padding: 'var(--space-3) 0 0 0', cursor: 'pointer', alignSelf: 'flex-start', fontSize: 'var(--font-size-sm)', marginTop: 'auto' }}
            >
              View All Tasks <ChevronRight size={16} />
            </button>
          </div>

          {/* Habits */}
          <div className="card animate-fadeInUp flex-col-card stagger-2" style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'bold', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔥 Habits
            </h2>
            <span style={{ position: 'absolute', top: 'var(--space-5)', right: 'var(--space-5)', background: 'rgba(255, 140, 0, 0.1)', color: '#FF8C00', padding: '4px 10px', borderRadius: '12px', fontSize: 'var(--font-size-xs)', fontWeight: 'bold' }}>
              {bestOverallStreak} Day Streak
            </span>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {activeHabits.slice(0, 3).map((h, i) => {
                const isDone = todaysCompletions.some(c => c.habit_id === h.id);
                return (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: i < Math.min(activeHabits.length, 3) - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button onClick={() => handleHabitToggle(h.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                        {isDone ? (
                           <div style={{ background: 'var(--color-success)', borderRadius: '50%', padding: '2px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <Check size={14} />
                           </div>
                        ) : (
                          <Circle size={20} color="var(--text-muted)" />
                        )}
                      </button>
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{h.title}</span>
                    </div>
                    {isDone ? <Flame size={16} color="#FF8C00" /> : <Flame size={16} color="var(--text-muted)" style={{opacity: 0.5}} />}
                  </div>
                )
              })}
              {activeHabits.length === 0 && <p style={{ color: 'var(--text-secondary)', padding: 'var(--space-2) 0', fontSize: 'var(--font-size-sm)' }}>No habits created yet.</p>}
            </div>
            <button 
              onClick={() => navigate('/habits')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--color-primary)', fontWeight: '600', padding: 'var(--space-3) 0 0 0', cursor: 'pointer', alignSelf: 'flex-start', fontSize: 'var(--font-size-sm)', marginTop: 'auto' }}
            >
              View Habits <ChevronRight size={16} />
            </button>
          </div>

          {/* Active Goals */}
          <div className="card animate-fadeInUp flex-col-card stagger-3">
            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'bold', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="var(--color-error)" /> Active Goals
            </h2>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {activeGoals.length > 0 ? activeGoals.map(g => (
                <div key={g.id}>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', marginBottom: '8px' }}>{g.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${g.progress}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '4px' }} />
                    </div>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--text-primary)' }}>{g.progress}%</span>
                  </div>
                </div>
              )) : (
                 <p style={{ color: 'var(--text-secondary)' }}>No active goals right now.</p>
              )}
            </div>
            <button 
              onClick={() => navigate('/goals')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start', fontSize: 'var(--font-size-sm)', marginTop: 'auto' }}
            >
              View Goals <ChevronRight size={16} />
            </button>
          </div>



          {/* Finance */}
          <div className="card animate-fadeInUp flex-col-card stagger-4" style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'bold', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={18} color="var(--color-success)" /> Finance
            </h2>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Spent Today</p>
                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--color-success)', lineHeight: 1, marginBottom: '8px' }}>
                  ₹{todayExpenses}
                </p>
                <span style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  On Budget <Check size={12} />
                </span>
              </div>
              {/* Mock SVG Line chart */}
              <svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 30 Q 15 15 25 25 T 50 20 T 75 5" stroke="var(--color-success)" strokeWidth="2" fill="none" />
                <path d="M0 30 Q 15 15 25 25 T 50 20 T 75 5 L 80 40 L 0 40 Z" fill="var(--color-success-light)" opacity="0.5" />
                <circle cx="75" cy="5" r="3" fill="var(--color-success)" />
              </svg>
            </div>
            <button 
              onClick={() => navigate('/finance')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--color-success)', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start', fontSize: 'var(--font-size-sm)', marginTop: 'auto' }}
            >
              View Finance <ChevronRight size={16} />
            </button>
          </div>
        </div>      </div>

      <TaskCompletionModal 
        isOpen={!!completedTaskData} 
        onClose={() => setCompletedTaskData(null)}
        taskName={completedTaskData?.name || ''}
        completedCount={completedTaskData?.completed || 0}
        totalCount={completedTaskData?.total || 0}
        isAllDone={completedTaskData?.allDone || false}
      />
    </>
  );
}
