import React from 'react';

const PLATFORM_CONFIG = {
  instagram: { label: 'Instagram', emoji: '📸', color: '#e1306c' },
  twitter:   { label: 'Twitter/X', emoji: '🐦', color: '#1da1f2' },
  linkedin:  { label: 'LinkedIn',  emoji: '💼', color: '#0077b5' },
  facebook:  { label: 'Facebook',  emoji: '👥', color: '#1877f2' },
  tiktok:    { label: 'TikTok',    emoji: '🎵', color: '#ff0050' },
  youtube:   { label: 'YouTube',   emoji: '▶️', color: '#ff0000' },
  general:   { label: 'General',   emoji: '📋', color: '#6366f1' },
};

export function PlatformBadge({ platform, size = 'sm' }) {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.general;
  const padding = size === 'lg' ? '4px 12px' : '2px 8px';
  const fontSize = size === 'lg' ? '0.8rem' : '0.7rem';

  return (
    <span style={{
      background: config.color + '22',
      color: config.color,
      border: `1px solid ${config.color}44`,
      borderRadius: 20,
      padding,
      fontSize,
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      whiteSpace: 'nowrap',
    }}>
      {config.emoji} {config.label}
    </span>
  );
}

export function PlatformSelect({ value, onChange, style = {} }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: '#0f172a',
        color: '#e2e8f0',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: '0.875rem',
        cursor: 'pointer',
        ...style,
      }}
    >
      {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
        <option key={key} value={key}>{cfg.emoji} {cfg.label}</option>
      ))}
    </select>
  );
}

export { PLATFORM_CONFIG };
export default PlatformBadge;
