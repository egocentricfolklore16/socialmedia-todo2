import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Sparkles, Calendar, X } from 'lucide-react';

export default function HolidayBanner() {
  const [holidays, setHolidays] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/calendar/holidays')
      .then(res => setHolidays(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = holidays.filter(h => !dismissed.includes(h.id));

  if (loading || visible.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
      {visible.map(holiday => {
        const dateStr = holiday.start?.date || holiday.start?.dateTime;
        const date = dateStr ? format(parseISO(dateStr), 'EEEE, MMMM d') : '';
        const isToday = dateStr === new Date().toISOString().split('T')[0];

        return (
          <div key={holiday.id} style={{
            background: isToday
              ? 'rgba(245, 158, 11, 0.1)'
              : 'var(--bg-card)',
            border: `1px solid ${isToday ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-default)'}`,
            borderLeft: `4px solid ${isToday ? 'var(--status-todo)' : 'var(--accent)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: isToday ? 'rgba(245, 158, 11, 0.18)' : 'var(--accent-light)',
                color: isToday ? 'var(--status-todo)' : 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {isToday ? <Sparkles size={18} /> : <Calendar size={18} />}
              </div>

              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                  {isToday ? 'Today is a Holiday: ' : 'Upcoming Holiday: '}
                  <span style={{ color: isToday ? 'var(--status-todo)' : 'var(--accent)', fontWeight: 700 }}>
                    {holiday.summary}
                  </span>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                  {date} — Prepare special promotional or holiday social media content in advance!
                </div>
              </div>
            </div>

            <button
              onClick={() => setDismissed(d => [...d, holiday.id])}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-xs)',
              }}
              aria-label="Dismiss banner"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
