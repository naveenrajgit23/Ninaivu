import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/helpers';
import type { MemoryItem, Subject, Note, Exam, StudySession, Expense, MoneyTracker, Investment, Goal, Task, Idea, Habit, HabitCompletion } from '../types';

interface Store {
  memory: MemoryItem[];
  subjects: Subject[];
  notes: Note[];
  exams: Exam[];
  studySessions: StudySession[];
  expenses: Expense[];
  moneyTracker: MoneyTracker[];
  investments: Investment[];
  goals: Goal[];
  tasks: Task[];
  ideas: Idea[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
}

const INITIAL_STORE: Store = {
  memory: [], subjects: [], notes: [], exams: [], studySessions: [],
  expenses: [], moneyTracker: [], investments: [], goals: [], tasks: [], ideas: [],
  habits: [], habitCompletions: []
};

type TableName = keyof Store;

const TABLE_MAP: Record<TableName, string> = {
  memory: 'memory', subjects: 'subjects', notes: 'notes', exams: 'exams',
  studySessions: 'study_sessions', expenses: 'expenses', moneyTracker: 'money_tracker',
  investments: 'investments', goals: 'goals', tasks: 'tasks', ideas: 'ideas',
  habits: 'habits', habitCompletions: 'habit_completions'
};

interface DataContextType extends Store {
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (table: TableName, item: any) => Promise<any>;
  updateItem: (table: TableName, id: string, data: any) => Promise<void>;
  deleteItem: (table: TableName, id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isDemo } = useAuth();
  const [store, setStore] = useState<Store>(INITIAL_STORE);
  const [loading, setLoading] = useState(true);

  // Load local data for demo mode
  const loadLocalData = useCallback(() => {
    try {
      const saved = localStorage.getItem('ninaivu-data');
      if (saved) {
        setStore(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse local data:', e instanceof Error ? e.message : 'Unknown error');
    }
    setLoading(false);
  }, []);

  // Save local data (debounce in real app, immediate here for demo)
  const saveLocalData = useCallback((newStore: Store) => {
    localStorage.setItem('ninaivu-data', JSON.stringify(newStore));
  }, []);

  const loadSupabaseData = useCallback(async () => {
    if (!user || !supabase) return;
    setLoading(true);

    const fetches = Object.keys(INITIAL_STORE).map(async (key) => {
      const tableName = TABLE_MAP[key as TableName];
      const { data } = await supabase!.from(tableName).select('*').order('created_at', { ascending: false });
      return { [key]: data || [] };
    });

    const results = await Promise.all(fetches);
    const newStore = results.reduce((acc, curr) => ({ ...acc, ...curr }), INITIAL_STORE);
    setStore(newStore as Store);
    setLoading(false);
  }, [user]);

  const refresh = useCallback(async () => {
    if (isDemo) loadLocalData();
    else await loadSupabaseData();
  }, [isDemo, loadLocalData, loadSupabaseData]);

  useEffect(() => {
    if (isDemo) {
      loadLocalData();
    } else if (user) {
      loadSupabaseData();
    } else {
      setStore(INITIAL_STORE);
      setLoading(false);
    }
  }, [user, isDemo, loadLocalData, loadSupabaseData]);

  // CRUD Operations
  const addItem = async (table: TableName, item: any) => {
    const newItem = { ...item, id: generateId(), created_at: new Date().toISOString() };
    
    if (isDemo) {
      setStore((prev) => {
        const next = { ...prev, [table]: [newItem, ...prev[table]] };
        
        // Auto-update goal progress if completing a linked habit
        if (table === 'habitCompletions') {
          const hId = item.habit_id;
          const habit = next.habits.find(h => h.id === hId);
          if (habit && habit.goal_id) {
            const goal = next.goals.find(g => g.id === habit.goal_id);
            if (goal) {
              const newProgress = Math.min(100, goal.progress + 5);
              next.goals = next.goals.map(g => g.id === goal.id ? { ...g, progress: newProgress } : g);
            }
          }
        }
        
        saveLocalData(next);
        return next;
      });
      return newItem;
    }

    if (!user || !supabase) return null;
    
    const insertPayload = table === 'habitCompletions' ? item : { ...item, user_id: user.id };
    const { data, error } = await supabase!.from(TABLE_MAP[table]).insert([insertPayload]).select().single();
    
    if (error) throw error;
    
    setStore((prev) => {
      const next = { ...prev, [table]: [data || newItem, ...prev[table]] };
      
      // Auto-update goal progress if completing a linked habit
      if (table === 'habitCompletions') {
        const hId = item.habit_id;
        const habit = next.habits.find(h => h.id === hId);
        if (habit && habit.goal_id) {
          const goal = next.goals.find(g => g.id === habit.goal_id);
          if (goal) {
            const newProgress = Math.min(100, goal.progress + 5);
            // Fire and forget update
            supabase!.from('goals').update({ progress: newProgress }).eq('id', goal.id).then(({ error: updateErr }) => {
              if (!updateErr) {
                setStore(s => ({ ...s, goals: s.goals.map(g => g.id === goal.id ? { ...g, progress: newProgress } : g) }));
              }
            });
          }
        }
      }
      
      return next;
    });
    return data || newItem;
  };

  const updateItem = async (table: TableName, id: string, updates: any) => {
    if (isDemo) {
      setStore((prev) => {
        const arr = prev[table] as any[];
        const nextArr = arr.map((item) => (item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item));
        const next = { ...prev, [table]: nextArr };
        saveLocalData(next);
        return next;
      });
      return;
    }

    if (!supabase) return;
    const { error } = await supabase!.from(TABLE_MAP[table]).update(updates).eq('id', id);
    if (error) throw error;

    setStore((prev) => {
      const arr = prev[table] as any[];
      return { ...prev, [table]: arr.map((item) => (item.id === id ? { ...item, ...updates } : item)) };
    });
  };

  const deleteItem = async (table: TableName, id: string) => {
    if (isDemo) {
      setStore((prev) => {
        const arr = prev[table] as any[];
        const next = { ...prev, [table]: arr.filter((item) => item.id !== id) };
        saveLocalData(next);
        return next;
      });
      return;
    }

    if (!supabase) return;
    const { error } = await supabase!.from(TABLE_MAP[table]).delete().eq('id', id);
    if (error) throw error;

    setStore((prev) => {
      const arr = prev[table] as any[];
      return { ...prev, [table]: arr.filter((item) => item.id !== id) };
    });
  };

  return (
    <DataContext.Provider value={{ ...store, loading, refresh, addItem, updateItem, deleteItem }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
