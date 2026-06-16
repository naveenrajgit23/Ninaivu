// ============================================================
// நினைவு (Ninaivu) — Supabase Client
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug: log whether env vars are present (not the values themselves)
console.log('[Ninaivu] Supabase URL present:', !!supabaseUrl, 'length:', supabaseUrl.length);
console.log('[Ninaivu] Supabase Key present:', !!supabaseAnonKey, 'length:', supabaseAnonKey.length);

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[Ninaivu] Supabase client created successfully');
  } catch (err) {
    console.error('[Ninaivu] Failed to create Supabase client:', err);
  }
} else {
  console.warn('[Ninaivu] Supabase not configured — running in demo mode');
}

export const supabase = supabaseInstance;
export const isSupabaseConfigured = !!supabase;
