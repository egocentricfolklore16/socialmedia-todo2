import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

export default function GoogleAuthBanner({ onConnect }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--accent-border)',
      borderRadius: 'var(--radius-md)',
      padding: '18px 22px',
      marginBottom: 'var(--space-6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 16,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-light)',
          border: '1px solid var(--accent-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
          flexShrink: 0,
        }}>
          <Calendar size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-display)' }}>
            Connect Google Calendar Integration
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 2 }}>
            Receive automated holiday reminders, sync content schedules, and streamline social ops
          </div>
        </div>
      </div>

      <button
        onClick={onConnect}
        style={{
          background: 'var(--accent)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 16px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 'var(--text-xs)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: 'var(--shadow-sm)',
          transition: 'all var(--transition-fast)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff" opacity="0.9"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#ffffff" opacity="0.8"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ffffff" opacity="0.95"/>
        </svg>
        Connect with Google
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
