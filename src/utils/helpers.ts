// ============================================================
// நினைவு (Ninaivu) — Helpers
// ============================================================

import { format, isToday as dfIsToday, isTomorrow as dfIsTomorrow, addDays } from 'date-fns';

export function formatDate(dateString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  
  if (options) return new Intl.DateTimeFormat('en-IN', options).format(d);
  
  return format(d, 'MMM d, yyyy');
}

export function isToday(dateString: string): boolean {
  return dfIsToday(new Date(dateString));
}

export function isTomorrow(dateString: string): boolean {
  return dfIsTomorrow(new Date(dateString));
}

export function isWithinDays(dateString: string, days: number): boolean {
  const d = new Date(dateString);
  const now = new Date();
  const future = addDays(now, days);
  return d >= now && d <= future;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function generateId(): string {
  return crypto.randomUUID();
}
