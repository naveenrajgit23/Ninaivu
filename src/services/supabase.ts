// ============================================================
// நினைவு (Ninaivu) — Supabase Client
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug: log whether env vars are present (not the values themselves)
console.log('[Ninaivu] Supabase URL present:', !!supabaseUrl, 'length:', supabaseUrl.length);
console.log('[Ninaivu] Supabase Key present:', !!supabaseAnonKey, 'length:', supabaseAnonKey.length);

let _supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[Ninaivu] Supabase client created successfully');
  } catch (err) {
    console.error('[Ninaivu] Failed to create Supabase client:', err);
  }
} else {
  console.warn('[Ninaivu] Supabase not configured — running in demo mode');
}

export const isSupabaseConfigured = !!_supabase;

/**
 * Returns the Supabase client or null.
 * Use getSupabase() when you need a non-null client after checking isSupabaseConfigured.
 */
export function getSupabase(): SupabaseClient | null {
  return _supabase;
}

/**
 * Returns the Supabase client, guaranteed non-null.
 * Only call after confirming isSupabaseConfigured is true.
 */
export function requireSupabase(): SupabaseClient {
  if (!_supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return _supabase;
}
