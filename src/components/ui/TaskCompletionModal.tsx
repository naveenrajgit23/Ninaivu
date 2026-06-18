import { useEffect, useState } from 'react';
import { Check, Target } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  completedCount: number;
  totalCount: number;
  isAllDone: boolean;
}

export default function TaskCompletionModal({ isOpen, onClose, taskName, completedCount, totalCount, isAllDone }: TaskCompletionModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;
  const remainingCount = Math.max(0, totalCount - completedCount);

  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
        opacity: show ? 1 : 0, transition: 'opacity 0.3s ease'
      }}
    >
      {isAllDone && show && <Confetti />}

      <div 
        style={{
          background: 'var(--bg-card)',
          borderRadius: '32px',
          padding: 'var(--space-8)',
          width: '90%', maxWidth: '400px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xl)',
          transform: show ? 'scale(1)' : 'scale(0.9)',
          opacity: show ? 1 : 0,
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {isAllDone ? (
          <>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-2)' }}>🎉</div>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>Everything Done!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>No tasks remaining today.</p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Enjoy your free time.</p>
            
            <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)' }}>
              <p style={{ fontWeight: '500', marginBottom: 'var(--space-1)' }}>You completed {completedCount} tasks today.</p>
              <p style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>🌱 Small wins build momentum.</p>
            </div>
          </>
        ) : (
          <>
            <div 
              style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'var(--color-success)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--space-6)',
                boxShadow: '0 0 30px var(--color-success-glow)'
              }}
            >
              <Check size={40} strokeWidth={3} />
            </div>

            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>✨ Great Job!</h2>
            <p style={{ fontWeight: '500', marginBottom: 'var(--space-1)' }}>{taskName}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>completed successfully</p>

            <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)' }}>
              <div style={{ color: 'var(--color-warning)', fontWeight: 'bold', marginBottom: 'var(--space-3)' }}>🏆 +1 Today's Win</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>
                <span>{completedCount} of {totalCount} tasks completed</span>
                <span style={{ fontWeight: 'bold' }}>{progressPct}%</span>
              </div>
              
              <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
                <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--color-success)', transition: 'width 1s ease-out' }} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                <Target size={14} /> {remainingCount} task{remainingCount !== 1 ? 's' : ''} remaining
              </div>
            </div>
          </>
        )}

        <button 
          onClick={onClose}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px',
            background: 'var(--gradient-brand)', color: 'white',
            fontWeight: 'bold', fontSize: 'var(--font-size-md)',
            border: 'none', cursor: 'pointer',
            transition: 'transform 0.2s ease',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isAllDone ? 'Close' : 'Continue →'}
        </button>
      </div>
    </div>,
    document.body
  );
}

// Simple CSS confetti
function Confetti() {
  const [particles] = useState(() => Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    animDuration: 1.5 + Math.random() * 3,
    delay: Math.random() * 0.5,
    color: ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#D4A017'][Math.floor(Math.random() * 6)]
  })));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
        `}
      </style>
      {particles.map(p => (
        <div 
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-10%',
            width: '8px', height: '8px',
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `fall ${p.animDuration}s linear ${p.delay}s forwards`
          }}
        />
      ))}
    </div>
  );
}
