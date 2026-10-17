import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { PLATFORM_CONFIG } from './PlatformBadge';
import { Calendar as CalendarIcon, Sparkles, CheckCircle2 } from 'lucide-react';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const platformColor = (platform) =>
  PLATFORM_CONFIG[platform?.toLowerCase()]?.color || PLATFORM_CONFIG.general.color;

export default function ContentCalendar() {
  const { tasks } = useApp();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

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

  // Merge all events for calendar
  const allEvents = [
    // Tasks with due dates
    ...tasks
      .filter(t => t.dueDate)
      .map(t => {
        const platformCfg = PLATFORM_CONFIG[t.platform?.toLowerCase()] || PLATFORM_CONFIG.general;
        return {
          id: `task-${t.id}`,
          title: `[${platformCfg.label}] ${t.title}`,
          start: new Date(t.dueDate),
          end: new Date(new Date(t.dueDate).getTime() + 45 * 60 * 1000),
          resource: { type: 'task', task: t },
        };
      }),

    // Google Calendar events
    ...calendarEvents
      .filter(e => !tasks.find(t => t.calendarEventId === e.id))
      .map(e => ({
        id: `gcal-${e.id}`,
        title: `${e.summary}`,
        start: new Date(e.start.dateTime || e.start.date),
        end: new Date(e.end.dateTime || e.end.date),
        resource: { type: 'gcal', event: e },
      })),

    // Holidays (quiet amber badge)
    ...holidays.map(h => ({
      id: `holiday-${h.id}`,
      title: `Holiday: ${h.summary}`,
      start: new Date(h.start.date || h.start.dateTime),
      end: new Date(h.end.date || h.end.dateTime || h.start.date),
      allDay: true,
      resource: { type: 'holiday', holiday: h },
    })),
  ];

  const eventPropGetter = (event) => {
    const { type, task } = event.resource || {};
    let backgroundColor = 'var(--accent)';
    let color = '#ffffff';
    let opacity = 1;
    let border = 'none';

    if (type === 'holiday') {
      backgroundColor = 'rgba(245, 158, 11, 0.15)';
      color = 'var(--status-todo)';
      border = '1px solid rgba(245, 158, 11, 0.3)';
    } else if (type === 'task') {
      backgroundColor = platformColor(task.platform);
      if (task.status === 'done') opacity = 0.55;
    } else {
      backgroundColor = 'var(--status-in-progress)';
    }

    return {
      style: {
        backgroundColor,
        color,
        border,
        borderRadius: 'var(--radius-xs)',
        opacity,
        fontSize: 'var(--text-xs)',
        padding: '3px 8px',
        fontWeight: 500,
        boxShadow: 'var(--shadow-sm)',
      },
    };
  };

  const handleSelectSlot = ({ start }) => {
    const dateStr = format(start, 'PPP');
    toast(`Selected ${dateStr} — use the Tasks tab to schedule a publication!`, {
      icon: <CalendarIcon size={16} style={{ color: 'var(--accent)' }} />,
      duration: 3000,
    });
  };

  const handleSelectEvent = (event) => {
    const { type, task, holiday } = event.resource || {};
    if (type === 'holiday') {
      toast(`Upcoming Holiday: ${holiday?.summary}`, {
        icon: <Sparkles size={16} style={{ color: 'var(--status-todo)' }} />,
        duration: 4000
      });
    } else if (type === 'task') {
      toast(`${task.title} · Status: ${task.status}`, {
        icon: <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />,
        duration: 3500
      });
    }
  };

  return (
    <div>
      {/* Legend & Summary */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
            PLUGINS & PLATFORMS:
          </span>
          {Object.entries(PLATFORM_CONFIG).slice(0, 6).map(([key, cfg]) => (
            <span key={key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: cfg.color,
                display: 'inline-block',
              }} />
              {cfg.label}
            </span>
          ))}

          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--status-todo)',
              display: 'inline-block',
            }} />
            Holidays
          </span>
        </div>

        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>
          {loading ? 'Refreshing calendar...' : `${allEvents.length} scheduled items`}
        </span>
      </div>

      {/* Calendar View Container */}
      <div style={{ height: 640 }}>
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
