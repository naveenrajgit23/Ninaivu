import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { TimerStatus } from '../types';

interface TimerContextType {
  selectedMinutes: number;
  customMinutes: string;
  remainingSeconds: number;
  status: TimerStatus;
  startedAt: string | null;
  setSelectedMinutes: (mins: number) => void;
  setCustomMinutes: (mins: string) => void;
  setRemainingSeconds: React.Dispatch<React.SetStateAction<number>>;
  setStatus: React.Dispatch<React.SetStateAction<TimerStatus>>;
  setStartedAt: (date: string | null) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  clearTimer: () => void;
  onSessionComplete: React.MutableRefObject<((elapsed: number, start: string, end: string) => void) | null>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onSessionComplete = useRef<((elapsed: number, start: string, end: string) => void) | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (status === 'idle') {
      setRemainingSeconds(selectedMinutes * 60);
      // Ensure we use the latest startedAt
      setStartedAt(new Date().toISOString());
    }
    setStatus('running');

    clearTimer();
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          setStatus('idle');
          if (onSessionComplete.current) {
             // Pass start and end time
             onSessionComplete.current(selectedMinutes, startedAt || new Date().toISOString(), new Date().toISOString());
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, selectedMinutes, startedAt, status]);

  const pauseTimer = useCallback(() => {
    setStatus('paused');
    clearTimer();
  }, [clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setStatus('idle');
    setRemainingSeconds(selectedMinutes * 60);
    setStartedAt(null);
  }, [clearTimer, selectedMinutes]);

  useEffect(() => {
    return () => clearTimer(); // cleanup only when provider unmounts (never)
  }, [clearTimer]);

  const value = {
    selectedMinutes, customMinutes, remainingSeconds, status, startedAt,
    setSelectedMinutes, setCustomMinutes, setRemainingSeconds, setStatus, setStartedAt,
    startTimer, pauseTimer, resetTimer, clearTimer,
    onSessionComplete
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
