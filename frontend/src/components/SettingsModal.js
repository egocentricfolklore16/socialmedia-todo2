import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PLATFORM_CONFIG } from './PlatformBadge';
import { Settings, X, Save, Bell, Globe, Share2 } from 'lucide-react';

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
];

export default function SettingsModal({ onClose }) {
  const { settings, updateSettings } = useApp();

  const [defaultPlatform, setDefaultPlatform] = useState(settings?.defaultPlatform || 'instagram');
  const [timezone, setTimezone] = useState(settings?.timezone || 'UTC');
  const [holidayAlerts, setHolidayAlerts] = useState(
    settings?.notificationPreferences?.holidayAlerts ?? true
  );
  const [taskReminders, setTaskReminders] = useState(
    settings?.notificationPreferences?.taskReminders ?? true
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        defaultPlatform,
        timezone,
        notificationPreferences: {
          holidayAlerts,
          taskReminders,
        },
      });
      onClose();
    } catch (err) {
      // toast error handled by AppContext
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ padding: 'var(--space-6)', maxWidth: 520 }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
          paddingBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-light)',
              border: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
            }}>
              <Settings size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>
                User Preferences
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                Configure defaults, timezone, and push notification triggers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close settings"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
            {/* Default Platform */}
            <div>
              <label style={labelStyle}>
                <Share2 size={13} style={{ display: 'inline', marginRight: 5 }} />
                Default Platform for New Tasks
              </label>
              <select
                value={defaultPlatform}
                onChange={e => setDefaultPlatform(e.target.value)}
                style={inputStyle}
              >
                {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>

            {/* Timezone Selection */}
            <div>
              <label style={labelStyle}>
                <Globe size={13} style={{ display: 'inline', marginRight: 5 }} />
                Timezone
              </label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                style={inputStyle}
              >
                {COMMON_TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            {/* Notification Preferences */}
            <div>
              <label style={labelStyle}>
                <Bell size={13} style={{ display: 'inline', marginRight: 5 }} />
                Notification Preferences
              </label>

              <div style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 8 }}>
                <label style={toggleRowStyle}>
                  <input
                    type="checkbox"
                    checked={holidayAlerts}
                    onChange={e => setHolidayAlerts(e.target.checked)}
                    style={{ accentColor: 'var(--accent)', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Holiday Alerts
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Receive notifications for upcoming national and social holidays
                    </div>
                  </div>
                </label>

                <label style={toggleRowStyle}>
                  <input
                    type="checkbox"
                    checked={taskReminders}
                    onChange={e => setTaskReminders(e.target.checked)}
                    style={{ accentColor: 'var(--accent)', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Task & Post Due Reminders
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Get push reminders 1 hour before scheduled post times
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <button
                type="button"
                onClick={onClose}
                style={cancelButtonStyle}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  ...submitButtonStyle,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Save size={15} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontSize: 'var(--text-xs)',
  color: 'var(--text-secondary)',
  fontWeight: 600,
};

const inputStyle = {
  width: '100%',
  background: 'var(--bg-input)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 12px',
  fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
};

const toggleRowStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  background: 'var(--bg-input)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 12px',
  cursor: 'pointer',
};

const cancelButtonStyle = {
  background: 'transparent',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 16px',
  cursor: 'pointer',
  fontSize: 'var(--text-xs)',
  fontWeight: 500,
};

const submitButtonStyle = {
  background: 'var(--accent)',
  color: '#ffffff',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 18px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 'var(--text-xs)',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  boxShadow: 'var(--shadow-sm)',
};
