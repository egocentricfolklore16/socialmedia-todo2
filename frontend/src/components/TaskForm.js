import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import { useApp } from '../context/AppContext';
import { PLATFORM_CONFIG } from './PlatformBadge';
import {
  X,
  Plus,
  Save,
  Calendar as CalendarIcon,
  Tag,
  FileText,
  AlertCircle,
  Hash,
  Check
} from 'lucide-react';

const CONTENT_TYPES = [
  { value: 'post', label: 'Post' },
  { value: 'reel', label: 'Reel / Short' },
  { value: 'story', label: 'Story' },
  { value: 'thread', label: 'Thread' },
  { value: 'video', label: 'Video' },
  { value: 'live', label: 'Live Stream' },
  { value: 'newsletter', label: 'Newsletter' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'var(--priority-low)' },
  { value: 'medium', label: 'Medium', color: 'var(--priority-medium)' },
  { value: 'high', label: 'High', color: 'var(--priority-high)' },
];

const STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function TaskForm({ initialData, onClose }) {
  const { addTask, updateTask, settings } = useApp();
  const titleInputRef = useRef(null);

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...initialData,
        notes: initialData.notes || '',
        campaign: initialData.campaign || '',
        hashtags: (initialData.hashtags || []).join(', '),
        dueDate: initialData.dueDate ? new Date(initialData.dueDate) : null,
      };
    }
    return {
      title: '',
      description: '',
      notes: '',
      campaign: '',
      dueDate: null,
      platform: settings?.defaultPlatform || 'instagram',
      priority: 'medium',
      status: 'todo',
      contentType: 'post',
      hashtags: '',
    };
  });

  const [validationError, setValidationError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(initialData);

  // Esc key listener & Focus on mount
  useEffect(() => {
    if (titleInputRef.current) titleInputRef.current.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (field === 'title' && value.trim()) setValidationError('');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setValidationError('Task title is required');
      if (titleInputRef.current) titleInputRef.current.focus();
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate ? form.dueDate.toISOString() : null,
        hashtags: form.hashtags
          ? form.hashtags.split(',').map(h => h.trim().replace(/^#/, '')).filter(Boolean)
          : [],
      };

      if (isEditing) {
        await updateTask(initialData.id, payload);
      } else {
        await addTask(payload);
      }
      onClose();
    } catch (err) {
      // Error handled by AppContext toast
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ padding: 'var(--space-6)', maxWidth: 620 }}
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
              {isEditing ? <FileText size={16} /> : <Plus size={16} />}
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>
                {isEditing ? 'Edit Task' : 'Create Social Media Task'}
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                Configure publication parameters, caption notes, and schedule date
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close form"
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
              transition: 'all var(--transition-fast)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {/* Title */}
            <div>
              <label style={labelStyle}>
                Task Title <span style={{ color: 'var(--priority-high)' }}>*</span>
              </label>
              <input
                ref={titleInputRef}
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. Q4 Product Launch Video Reel"
                style={{
                  ...inputStyle,
                  borderColor: validationError ? 'var(--priority-high)' : 'var(--border-default)',
                }}
              />
              {validationError && (
                <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--priority-high)',
                  marginTop: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <AlertCircle size={13} /> {validationError}
                </div>
              )}
            </div>

            {/* Platform Selector */}
            <div>
              <label style={labelStyle}>Platform</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                gap: 6,
              }}>
                {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const isSelected = form.platform === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => set('platform', key)}
                      style={{
                        background: isSelected ? `${cfg.color}18` : 'var(--bg-input)',
                        color: isSelected ? cfg.color : 'var(--text-secondary)',
                        border: `1px solid ${isSelected ? cfg.color : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 6px',
                        cursor: 'pointer',
                        fontSize: 'var(--text-xs)',
                        fontWeight: isSelected ? 600 : 500,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <Icon size={16} strokeWidth={isSelected ? 2.2 : 1.75} />
                      <span style={{ fontSize: '0.7rem' }}>{cfg.label.split('/')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row: Content Type & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <label style={labelStyle}>Content Type</label>
                <select
                  value={form.contentType}
                  onChange={e => set('contentType', e.target.value)}
                  style={inputStyle}
                >
                  {CONTENT_TYPES.map(ct => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  style={inputStyle}
                >
                  {STATUSES.map(st => (
                    <option key={st.value} value={st.value}>{st.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority Segmented Control */}
            <div>
              <label style={labelStyle}>Priority</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 6,
                background: 'var(--bg-input)',
                padding: 4,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}>
                {PRIORITIES.map(p => {
                  const isSelected = form.priority === p.value;
                  return (
                    <button
                      type="button"
                      key={p.value}
                      onClick={() => set('priority', p.value)}
                      style={{
                        background: isSelected ? 'var(--bg-card)' : 'transparent',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                        border: isSelected ? '1px solid var(--border-default)' : '1px solid transparent',
                        borderRadius: 'var(--radius-xs)',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: 'var(--text-xs)',
                        fontWeight: isSelected ? 600 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: p.color,
                        display: 'inline-block',
                      }} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule Date & Time */}
            <div>
              <label style={labelStyle}>
                <CalendarIcon size={12} style={{ display: 'inline', marginRight: 4 }} />
                Schedule Date & Time
              </label>
              <DatePicker
                selected={form.dueDate}
                onChange={date => set('dueDate', date)}
                showTimeSelect
                timeFormat="h:mm aa"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy  •  h:mm aa"
                placeholderText="Select publication date and time..."
                customInput={<input style={inputStyle} />}
                popperPlacement="bottom-start"
              />
            </div>

            {/* Caption Draft / Notes (with character count) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={labelStyle}>Caption Draft & Copy Notes</label>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {form.notes.length} chars
                </span>
              </div>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Draft caption, hooks, call to action, or key bullet points..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Campaign & Hashtags Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <label style={labelStyle}>
                  <Tag size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Campaign / Tag
                </label>
                <input
                  value={form.campaign}
                  onChange={e => set('campaign', e.target.value)}
                  placeholder="e.g. Q4 Launch, Black Friday"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <Hash size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Hashtags
                </label>
                <input
                  value={form.hashtags}
                  onChange={e => set('hashtags', e.target.value)}
                  placeholder="marketing, SaaS, growth"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* General Description */}
            <div>
              <label style={labelStyle}>Additional Asset Links & Notes</label>
              <input
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Links to Figma, Canva, Drive assets..."
                style={inputStyle}
              />
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-4)',
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
                {saving ? (
                  <>Saving...</>
                ) : isEditing ? (
                  <><Check size={16} /> Save Changes</>
                ) : (
                  <><Save size={16} /> Create Task</>
                )}
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
  transition: 'border-color var(--transition-fast)',
};

const cancelButtonStyle = {
  background: 'transparent',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 18px',
  cursor: 'pointer',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
};

const submitButtonStyle = {
  background: 'var(--accent)',
  color: '#ffffff',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 20px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 'var(--text-sm)',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  boxShadow: 'var(--shadow-sm)',
};
