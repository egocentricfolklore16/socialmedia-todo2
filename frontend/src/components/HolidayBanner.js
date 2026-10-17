import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
      {visible.map(holiday => {
        const dateStr = holiday.start?.date || holiday.start?.dateTime;
        const date = dateStr ? format(parseISO(dateStr), 'EEEE, MMMM d') : '';
        const isToday = dateStr === new Date().toISOString().split('T')[0];

        return (
          <div key={holiday.id} style={{
            background: isToday
              ? 'linear-gradient(135deg, #78350f22, #92400e22)'
              : 'linear-gradient(135deg, #1e293b, #1a2744)',
            border: `1px solid ${isToday ? '#f59e0b55' : '#6366f133'}`,
            borderLeft: `4px solid ${isToday ? '#f59e0b' : '#6366f1'}`,
            borderRadius: 10,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>{isToday ? '🎉' : '📅'}</span>
              <div>
                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>
                  {isToday ? 'Today is a holiday! ' : 'Upcoming holiday: '}
                  <span style={{ color: isToday ? '#fbbf24' : '#a5b4fc' }}>
                    {holiday.summary}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                  📅 {date} — Plan your social media content in advance!
                </div>
              </div>
            </div>

            <button
              onClick={() => setDismissed(d => [...d, holiday.id])}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: 4,
              }}
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
