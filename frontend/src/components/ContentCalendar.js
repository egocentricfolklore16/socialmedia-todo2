import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { PLATFORM_CONFIG } from './PlatformBadge';

// Set up localizer
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Map platform → hex color for calendar events
const platformColor = (platform) =>
  PLATFORM_CONFIG[platform]?.color || PLATFORM_CONFIG.general.color;

export default function ContentCalendar() {
  const { tasks } = useApp();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  // ── Build events from tasks + calendar + holidays ─────────────────────────
  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0);

      const [gcalRes, holidayRes] = await Promise.allSettled([
        axios.get('/api/calendar/events', {
          params: { start: startOfMonth.toISOString(), end: endOfMonth.toISOString() },
        }),
        axios.get('/api/calendar/holidays'),
      ]);

      if (gcalRes.status === 'fulfilled') {
        setCalendarEvents(gcalRes.value.data || []);
      }
      if (holidayRes.status === 'fulfilled') {
        setHolidays(holidayRes.value.data || []);
      }
    } catch (err) {
      console.error('[Calendar] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchCalendarData(); }, [fetchCalendarData]);

  // ── Merge all events for the calendar ─────────────────────────────────────
  const allEvents = [
    // Tasks with due dates
    ...tasks
      .filter(t => t.dueDate)
      .map(t => ({
        id: `task-${t.id}`,
        title: `${PLATFORM_CONFIG[t.platform]?.emoji || '📋'} ${t.title}`,
        start: new Date(t.dueDate),
        end: new Date(new Date(t.dueDate).getTime() + 60 * 60 * 1000),
        resource: { type: 'task', task: t },
      })),

    // Google Calendar events
    ...calendarEvents
      .filter(e => !tasks.find(t => t.calendarEventId === e.id)) // avoid dupes
      .map(e => ({
        id: `gcal-${e.id}`,
        title: `🗓 ${e.summary}`,
        start: new Date(e.start.dateTime || e.start.date),
        end: new Date(e.end.dateTime || e.end.date),
        resource: { type: 'gcal', event: e },
      })),

    // Holidays
    ...holidays.map(h => ({
      id: `holiday-${h.id}`,
      title: `🎉 ${h.summary}`,
      start: new Date(h.start.date || h.start.dateTime),
      end: new Date(h.end.date || h.end.dateTime || h.start.date),
      allDay: !!h.start.date,
      resource: { type: 'holiday', holiday: h },
    })),
  ];

  // ── Custom event styles ────────────────────────────────────────────────────
  const eventPropGetter = (event) => {
    const { type, task } = event.resource || {};
    let color = '#6366f1';
    let opacity = 1;

    if (type === 'holiday') {
      color = '#f59e0b';
    } else if (type === 'task') {
      color = platformColor(task.platform);
      if (task.status === 'done') opacity = 0.5;
    } else {
      color = '#3b82f6';
    }

    return {
      style: {
        backgroundColor: color,
        border: 'none',
        borderRadius: 4,
        opacity,
        fontSize: '0.75rem',
        padding: '2px 6px',
      },
      className: type === 'holiday' ? 'holiday-event' : '',
    };
  };

  // ── Click to add quick task on a day ──────────────────────────────────────
  const handleSelectSlot = ({ start }) => {
    const dateStr = format(start, 'PPP');
    toast(`📅 Selected ${dateStr} — use the Tasks tab to schedule a post!`, {
      duration: 3000, icon: '📅',
    });
  };

  const handleSelectEvent = (event) => {
    const { type, task, holiday } = event.resource || {};
    if (type === 'holiday') {
      toast(`🎉 ${holiday?.summary} — Plan your holiday posts!`, { duration: 4000 });
    } else if (type === 'task') {
      toast(
        `${PLATFORM_CONFIG[task.platform]?.emoji || '📋'} ${task.title} · ${task.status}`,
        { duration: 3000 }
      );
    }
  };

  return (
    <div>
      {/* Legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12,
        marginBottom: 16, alignItems: 'center',
      }}>
        <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Legend:</span>
        {Object.entries(PLATFORM_CONFIG).slice(0, 6).map(([key, cfg]) => (
          <span key={key} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: '0.75rem', color: '#94a3b8',
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: 2,
              background: cfg.color, display: 'inline-block',
            }} />
            {cfg.label}
          </span>
        ))}
        <span style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: '0.75rem', color: '#94a3b8',
        }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f59e0b', display: 'inline-block' }} />
          Holidays
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#64748b' }}>
          {loading ? '⏳ Loading calendar...' : `${allEvents.length} events`}
        </span>
      </div>

      {/* Calendar */}
      <div style={{ height: 620 }}>
        <Calendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventPropGetter}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          popup
          tooltipAccessor="title"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
}
