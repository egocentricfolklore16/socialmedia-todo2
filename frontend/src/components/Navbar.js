import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckSquare, Calendar, Sun, Moon, Settings, CheckCircle2 } from 'lucide-react';

const TABS = [
  { id: 'todos', label: 'Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Content Calendar', icon: Calendar },
];

export default function Navbar({ activeTab, setActiveTab, onOpenSettings, authStatus }) {
  const { theme, toggleTheme } = useApp();

  return (
    <header style={{
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-default)',
      padding: '0 var(--space-6)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'background 0.2s ease, border-color 0.2s ease',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
      }}>
        {/* Logo & Mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'var(--text-base)',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}>
              SocialTodo
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: 'var(--accent)',
              background: 'var(--accent-light)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--accent-border)',
            }}>
              SaaS
            </span>
          </div>
        </div>

        {/* Segmented Tab Control */}
        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 3,
          display: 'flex',
          gap: 2,
        }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 'var(--text-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all var(--transition-fast)',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <Icon size={14} strokeWidth={isActive ? 2.2 : 1.75} style={{ color: isActive ? 'var(--accent)' : 'inherit' }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Actions Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Google Auth Status Badge */}
          {authStatus && (
            <div
              title="Google Calendar Connected"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={13} />
              <span>GCal Sync</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {theme === 'dark' ? <Sun size={15} strokeWidth={1.75} /> : <Moon size={15} strokeWidth={1.75} />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            aria-label="Open settings"
            title="User Settings"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Settings size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
}
