import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (username: string, pass: string) => Promise<{ error: string | null }>;
  signUp: (username: string, pass: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemo = !isSupabaseConfigured;

  useEffect(() => {
    if (isDemo) {
      setLoading(false);
      return;
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    }).catch((err) => {
      console.error('[Ninaivu] Failed to get session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user.id);
      else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      setUser(data as User);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, pass: string) => {
    if (isDemo) return { error: 'Auth disabled in demo mode' };
    if (!supabase) return { error: 'Supabase is not configured. Check environment variables.' };
    try {
      const email = `${username.toLowerCase().trim()}@ninaivu.local`;
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      return { error: error?.message || null };
    } catch (err: unknown) {
      console.error('[Ninaivu] Sign-in network error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        return { error: 'Cannot reach Supabase. Please check your internet connection and Supabase configuration.' };
      }
      return { error: message };
    }
  };

  const signUp = async (username: string, pass: string, name: string) => {
    if (isDemo) return { error: 'Auth disabled in demo mode' };
    if (!supabase) return { error: 'Supabase is not configured. Check environment variables.' };
    try {
      const email = `${username.toLowerCase().trim()}@ninaivu.local`;
      const { error } = await supabase.auth.signUp({
        email, password: pass,
        options: { data: { username: username.toLowerCase().trim(), full_name: name } }
      });
      return { error: error?.message || null };
    } catch (err: unknown) {
      console.error('[Ninaivu] Sign-up network error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        return { error: 'Cannot reach Supabase. Please check your internet connection and Supabase configuration.' };
      }
      return { error: message };
    }
  };

  const signOut = async () => {
    if (isDemo) return;
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: Partial<User>) => {
    if (isDemo) {
      if (user) setUser({ ...user, ...data });
      return;
    }
    if (!user) return;
    if (!supabase) return;
    const { error } = await supabase.from('users').update(data).eq('id', user.id);
    if (!error) setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
