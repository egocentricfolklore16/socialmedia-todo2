import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useApp } from '../context/AppContext';
import { PlatformSelect } from './PlatformBadge';

const defaultForm = {
  title: '',
  description: '',
  dueDate: null,
  platform: 'general',
  priority: 'medium',
  status: 'todo',
  contentType: 'post',
  hashtags: '',
};

export default function TaskForm({ initialData, onClose }) {
  const { addTask, updateTask } = useApp();
  const [form, setForm] = useState(
    initialData
      ? { ...initialData, hashtags: (initialData.hashtags || []).join(', '), dueDate: initialData.dueDate ? new Date(initialData.dueDate) : null }
      : defaultForm
  );
  const [saving, setSaving] = useState(false);

  const isEditing = !!initialData;

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
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
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 12,
      padding: 24,
      marginBottom: 20,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20,
      }}>
        <h3 style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 600 }}>
          {isEditing ? '✏️ Edit Task' : '+ New Social Media Task'}
        </h3>
        <button onClick={onClose} style={closeBtnStyle}>✕</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Title */}
          <div>
            <Label>Task Title *</Label>
            <input
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Post Q4 product launch reel"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description / Caption Notes</Label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Caption ideas, key messages, links to assets..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Row: Platform + Content Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>Platform</Label>
              <PlatformSelect value={form.platform} onChange={v => set('platform', v)} style={{ width: '100%' }} />
            </div>
            <div>
              <Label>Content Type</Label>
              <select value={form.contentType} onChange={e => set('contentType', e.target.value)} style={{ ...inputStyle }}>
                <option value="post">📷 Post</option>
                <option value="reel">🎬 Reel / Short</option>
                <option value="story">📖 Story</option>
                <option value="thread">🧵 Thread</option>
                <option value="video">🎥 Video</option>
                <option value="live">🔴 Live</option>
                <option value="newsletter">📧 Newsletter</option>
              </select>
            </div>
          </div>

          {/* Row: Priority + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>Priority</Label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} style={inputStyle}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
                <option value="todo">⏳ To Do</option>
                <option value="in-progress">🔄 In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <Label>Schedule / Due Date & Time</Label>
            <DatePicker
              selected={form.dueDate}
              onChange={date => set('dueDate', date)}
              showTimeSelect
              timeFormat="h:mm aa"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="Pick a date and time..."
              customInput={<input style={inputStyle} />}
              popperPlacement="bottom-start"
            />
          </div>

          {/* Hashtags */}
          <div>
            <Label>Hashtags (comma-separated)</Label>
            <input
              value={form.hashtags}
              onChange={e => set('hashtags', e.target.value)}
              placeholder="#SocialMedia, #ContentCreator, #Marketing"
              style={inputStyle}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              style={{
                ...submitBtnStyle,
                opacity: saving || !form.title.trim() ? 0.6 : 1,
              }}
            >
              {saving ? '⏳ Saving...' : isEditing ? '✅ Save Changes' : '✅ Create Task'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Label({ children }) {
  return (
    <label style={{
      display: 'block', marginBottom: 6,
      fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500,
    }}>
      {children}
    </label>
  );
}

const inputStyle = {
  width: '100%',
  background: '#0f172a',
  color: '#e2e8f0',
  border: '1px solid #334155',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
};

const closeBtnStyle = {
  background: 'transparent',
  border: 'none', color: '#64748b',
  cursor: 'pointer', fontSize: '1.1rem', padding: 4,
};

const cancelBtnStyle = {
  background: 'transparent',
  color: '#64748b',
  border: '1px solid #334155',
  borderRadius: 8, padding: '10px 20px',
  cursor: 'pointer', fontSize: '0.875rem',
};

const submitBtnStyle = {
  background: '#6366f1',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 22px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.875rem',
};
