import React from 'react';
import { useApp } from '../context/AppContext';
import { Layers, Clock, Loader, CheckCircle2, AlertTriangle } from 'lucide-react';

const STAT_CONFIG = [
  { key: 'total',      label: 'Total Tasks',   icon: Layers,        color: 'var(--accent)' },
  { key: 'todo',       label: 'To Do',         icon: Clock,         color: 'var(--status-todo)' },
  { key: 'inProgress', label: 'In Progress',   icon: Loader,        color: 'var(--status-in-progress)' },
  { key: 'done',       label: 'Completed',     icon: CheckCircle2,  color: 'var(--status-done)' },
  { key: 'overdue',   label: 'Overdue',        icon: AlertTriangle, color: 'var(--priority-high)' },
];

export default function StatsBar() {
  const { stats, loading } = useApp();

  if (loading && !stats) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
      }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-md)' }} />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const total = stats.total || 1; // avoid divide by zero

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
      gap: 'var(--space-3)',
      marginBottom: 'var(--space-6)',
    }}>
      {STAT_CONFIG.map(card => {
        const value = stats[card.key] ?? 0;
        const Icon = card.icon;
        const isAlert = card.key === 'overdue' && value > 0;
        const percentage = Math.round((value / total) * 100);

        return (
          <div
            key={card.key}
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${isAlert ? 'rgba(244, 63, 94, 0.35)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: `calc(${card.color})`,
                backgroundColor: isAlert ? 'rgba(244, 63, 94, 0.15)' : `${card.color}15`,
                border: `1px solid ${isAlert ? 'rgba(244, 63, 94, 0.3)' : card.color + '30'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isAlert ? 'var(--priority-high)' : card.color,
                flexShrink: 0,
              }}>
                <Icon size={18} strokeWidth={2} />
              </div>

              <div>
                <div style={{
                  fontSize: 'var(--text-xl)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  color: isAlert ? 'var(--priority-high)' : 'var(--text-primary)',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}>
                  {value}
                </div>
                <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  marginTop: 4,
                  fontWeight: 500,
                }}>
                  {card.label}
                </div>
              </div>
            </div>

            {/* Mini Progress Ring / Spark visual */}
            <div style={{ width: 32, height: 32, flexShrink: 0 }}>
              <ProgressRing
                percentage={card.key === 'total' ? 100 : percentage}
                color={isAlert ? 'var(--priority-high)' : card.color}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProgressRing({ percentage = 0, color = 'var(--accent)' }) {
  const radius = 12;
  const stroke = 2.5;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
      <circle
        stroke="var(--bg-subtle)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.3s ease' }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}
