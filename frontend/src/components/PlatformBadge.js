import React from 'react';
import { Share2 } from 'lucide-react';

// Custom SVG Brand Icons for consistent rendering
const InstagramIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const TwitterIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
  </svg>
);

const LinkedinIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const FacebookIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TiktokIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
);

const YoutubeIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const PLATFORM_CONFIG = {
  instagram: { label: 'Instagram', color: '#e1306c', icon: InstagramIcon },
  twitter:   { label: 'Twitter/X', color: '#38bdf8', icon: TwitterIcon },
  linkedin:  { label: 'LinkedIn',  color: '#0a66c2', icon: LinkedinIcon },
  facebook:  { label: 'Facebook',  color: '#1877f2', icon: FacebookIcon },
  tiktok:    { label: 'TikTok',    color: '#00f2fe', icon: TiktokIcon },
  youtube:   { label: 'YouTube',   color: '#ff0000', icon: YoutubeIcon },
  general:   { label: 'General',   color: '#6366f1', icon: Share2 },
};

export function PlatformBadge({ platform, size = 'sm' }) {
  const config = PLATFORM_CONFIG[platform?.toLowerCase()] || PLATFORM_CONFIG.general;
  const Icon = config.icon;

  const isLg = size === 'lg';
  const padding = isLg ? '4px 10px' : '2px 8px';
  const fontSize = isLg ? '0.8rem' : '0.72rem';
  const iconSize = isLg ? 14 : 12;

  return (
    <span style={{
      background: `${config.color}15`,
      color: config.color,
      border: `1px solid ${config.color}35`,
      borderRadius: 'var(--radius-full)',
      padding,
      fontSize,
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      whiteSpace: 'nowrap',
      lineHeight: 1.2,
    }}>
      <Icon size={iconSize} color={config.color} />
      {config.label}
    </span>
  );
}

export function PlatformSelect({ value, onChange, style = {} }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: 'var(--bg-input)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 12px',
        fontSize: 'var(--text-sm)',
        fontFamily: 'inherit',
        cursor: 'pointer',
        outline: 'none',
        ...style,
      }}
    >
      {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
        <option key={key} value={key}>{cfg.label}</option>
      ))}
    </select>
  );
}

export { PLATFORM_CONFIG };
export default PlatformBadge;
