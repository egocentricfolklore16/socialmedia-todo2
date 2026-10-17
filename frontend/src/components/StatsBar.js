import React from 'react';
import { useApp } from '../context/AppContext';

const STAT_CARDS = [
  { key: 'total',      label: 'Total Tasks',   emoji: '📋', color: '#6366f1' },
  { key: 'todo',       label: 'To Do',         emoji: '⏳', color: '#f59e0b' },
  { key: 'inProgress', label: 'In Progress',   emoji: '🔄', color: '#3b82f6' },
  { key: 'done',       label: 'Completed',     emoji: '✅', color: '#22c55e' },
  { key: 'overdue',   label: 'Overdue',        emoji: '🚨', color: '#ef4444' },
];

export default function StatsBar() {
  const { stats } = useApp();

  if (!stats) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: 12,
      marginBottom: 24,
    }}>
      {STAT_CARDS.map(card => {
        const value = stats[card.key] ?? 0;
        const isAlert = card.key === 'overdue' && value > 0;
        return (
          <div key={card.key} style={{
            background: '#1e293b',
            border: `1px solid ${isAlert ? '#ef444433' : '#334155'}`,
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'border-color 0.15s',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: card.color + '22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0,
            }}>
              {card.emoji}
            </div>
            <div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: isAlert ? '#ef4444' : card.color,
                lineHeight: 1,
              }}>
                {value}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                {card.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
