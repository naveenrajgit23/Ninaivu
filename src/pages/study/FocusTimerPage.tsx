// ============================================================
// நினைவு (Ninaivu) — Focus Timer Page
// ============================================================

import { useEffect } from 'react';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { formatTimer } from '../../utils/helpers';
import { TIMER_PRESETS } from '../../utils/constants';

import { useTimer } from '../../contexts/TimerContext';

export default function FocusTimerPage() {
  const { addItem } = useData();
  const { showToast } = useToast();

  const {
    selectedMinutes, customMinutes, remainingSeconds, status, startedAt,
    setSelectedMinutes, setCustomMinutes, setRemainingSeconds,
    startTimer, pauseTimer, resetTimer, onSessionComplete
  } = useTimer();

  const totalSeconds = selectedMinutes * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) : 0;
  const circumference = 2 * Math.PI * 108; // radius=108

  useEffect(() => {
    onSessionComplete.current = (elapsed, start, end) => {
      addItem('studySessions', {
        duration_minutes: elapsed,
        started_at: start,
        ended_at: end,
      });
      showToast(`Session completed! ${elapsed} min focused.`, 'success');
    };
  }, [addItem, showToast, onSessionComplete]);

  const selectPreset = (mins: number) => {
    if (status !== 'idle') return;
    setSelectedMinutes(mins);
    setRemainingSeconds(mins * 60);
    setCustomMinutes('');
  };

  const applyCustom = () => {
    const mins = parseInt(customMinutes);
    if (isNaN(mins) || mins < 1 || mins > 180) return;
    setSelectedMinutes(mins);
    setRemainingSeconds(mins * 60);
  };

  return (
    <>
      <TopBar title="Focus Timer" subtitle="Stay focused and productive" />

      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 'var(--space-6)' }}>
        {/* Timer Circle */}
        <div className="timer-circle animate-scaleIn" style={{ marginBottom: 'var(--space-8)' }}>
          <svg width="240" height="240" viewBox="0 0 240 240">
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <circle
              cx="120" cy="120" r="108"
              fill="none"
              className="timer-circle-bg"
              strokeWidth="8"
            />
            <circle
              cx="120" cy="120" r="108"
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="timer-display">
            <span className="timer-time">{formatTimer(remainingSeconds)}</span>
            <span className="timer-label">
              {status === 'running' ? 'Focusing...' : status === 'paused' ? 'Paused' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8 animate-fadeInUp stagger-2">
          <button
            className="btn btn-icon btn-secondary"
            onClick={resetTimer}
            disabled={status === 'idle'}
            style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', opacity: status === 'idle' ? 0.5 : 1 }}
          >
            <RotateCcw size={20} />
          </button>

          <button
            className="btn btn-primary"
            onClick={status === 'running' ? pauseTimer : startTimer}
            style={{ width: 72, height: 72, borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-lg)' }}
          >
            {status === 'running' ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 2 }} />}
          </button>

          <button
            className="btn btn-icon btn-secondary"
            onClick={() => {
              if (status === 'running' || status === 'paused') {
                const elapsed = Math.round((totalSeconds - remainingSeconds) / 60);
                if (elapsed > 0) {
                  addItem('studySessions', {
                    duration_minutes: elapsed,
                    started_at: startedAt || new Date().toISOString(),
                    ended_at: new Date().toISOString(),
                  });
                  showToast(`Session saved! ${elapsed} min focused.`, 'success');
                }
                resetTimer();
              }
            }}
            disabled={status === 'idle'}
            style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', opacity: status === 'idle' ? 0.5 : 1 }}
          >
            <Check size={20} />
          </button>
        </div>

        {/* Presets */}
        {status === 'idle' && (
          <div className="animate-fadeInUp stagger-3" style={{ width: '100%', maxWidth: 400 }}>
            <h3 className="text-sm font-semibold text-muted mb-3 text-center">Select Duration</h3>
            <div className="flex gap-2 justify-center" style={{ flexWrap: 'wrap' }}>
              {TIMER_PRESETS.map((mins) => (
                <button
                  key={mins}
                  className={`chip ${selectedMinutes === mins ? 'chip-active' : ''}`}
                  onClick={() => selectPreset(mins)}
                  style={{ padding: 'var(--space-2) var(--space-4)' }}
                >
                  {mins} min
                </button>
              ))}
            </div>

            {/* Custom timer */}
            <div className="flex items-center gap-2 mt-4 justify-center">
              <input
                className="input"
                type="number"
                placeholder="Custom"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                style={{ width: 100, textAlign: 'center' }}
                min={1}
                max={180}
                id="timer-custom-input"
              />
              <span className="text-sm text-muted">min</span>
              <button className="btn btn-sm btn-secondary" onClick={applyCustom}>Set</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
