import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/helpers';
import type { MemoryItem, Subject, Note, Exam, StudySession, Expense, MoneyTracker, Investment, Goal, Task, Idea } from '../types';

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
}

const INITIAL_STORE: Store = {
  memory: [], subjects: [], notes: [], exams: [], studySessions: [],
  expenses: [], moneyTracker: [], investments: [], goals: [], tasks: [], ideas: []
};

type TableName = keyof Store;

const TABLE_MAP: Record<TableName, string> = {
  memory: 'memory', subjects: 'subjects', notes: 'notes', exams: 'exams',
  studySessions: 'study_sessions', expenses: 'expenses', moneyTracker: 'money_tracker',
  investments: 'investments', goals: 'goals', tasks: 'tasks', ideas: 'ideas'
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
      console.error('Failed to parse local data', e);
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
      const { data } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
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
        saveLocalData(next);
        return next;
      });
      return newItem;
    }

    if (!user || !supabase) return null;
    const { data, error } = await supabase.from(TABLE_MAP[table]).insert([{ ...item, user_id: user.id }]).select().single();
    if (error) throw error;
    
    setStore((prev) => ({ ...prev, [table]: [data, ...prev[table]] }));
    return data;
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
    const { error } = await supabase.from(TABLE_MAP[table]).update(updates).eq('id', id);
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
    const { error } = await supabase.from(TABLE_MAP[table]).delete().eq('id', id);
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
