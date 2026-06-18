import React from 'react';
import { Trophy, Star, Medal, Zap, Crown } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  'Trophy': <Trophy size={18} />,
  'Star': <Star size={18} />,
  'Medal': <Medal size={18} />,
  'Zap': <Zap size={18} />,
  'Crown': <Crown size={18} />,
};

interface AchievementBadgeProps {
  title: string;
  iconName?: string;
  xpReward: number;
  unlocked?: boolean;
}

export default function AchievementBadge({ title, iconName = 'Trophy', xpReward, unlocked = false }: AchievementBadgeProps) {
  const icon = ICON_MAP[iconName] || <Trophy size={18} />;

  return (
    <div
      className="card card-interactive"
      style={{
        padding: 'var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
        textAlign: 'center',
        opacity: unlocked ? 1 : 0.6,
        filter: unlocked ? 'none' : 'grayscale(100%)',
        border: unlocked ? '1px solid var(--color-accent)' : '1px solid var(--border-subtle)',
        background: unlocked ? 'linear-gradient(145deg, rgba(212, 160, 23, 0.1), var(--bg-card))' : 'var(--bg-card)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: unlocked ? 'var(--color-accent-light)' : 'var(--bg-elevated)',
          color: unlocked ? 'var(--color-accent)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: unlocked ? 'var(--shadow-glow)' : 'none',
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: unlocked ? 'var(--color-accent)' : 'var(--text-primary)' }}>
          {title}
        </div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          +{xpReward} XP
        </div>
      </div>
    </div>
  );
}
