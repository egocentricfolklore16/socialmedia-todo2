import React from 'react';

const TABS = [
  { id: 'todos', label: '✅ Tasks', emoji: '✅' },
  { id: 'calendar', label: '📅 Content Calendar', emoji: '📅' },
];

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav style={{
      background: '#1e293b',
      borderBottom: '1px solid #334155',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.5rem' }}>📣</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#e2e8f0' }}>SocialTodo</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Social Media Manager</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? '#6366f1' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#94a3b8',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: '0.875rem',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: badge */}
        <div style={{
          background: '#6366f122',
          border: '1px solid #6366f144',
          borderRadius: 20,
          padding: '4px 12px',
          fontSize: '0.75rem',
          color: '#a5b4fc',
        }}>
          🚀 Never miss a post
        </div>
      </div>
    </nav>
  );
}
