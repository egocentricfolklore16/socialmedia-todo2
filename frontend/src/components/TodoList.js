import React, { useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { useApp } from '../context/AppContext';
import TaskForm from './TaskForm';
import { PlatformBadge } from './PlatformBadge';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: '#ef4444', emoji: '🔴' },
  medium: { label: 'Medium', color: '#f59e0b', emoji: '🟡' },
  low:    { label: 'Low',    color: '#22c55e', emoji: '🟢' },
};

const STATUS_CONFIG = {
  'todo':        { label: 'To Do',       color: '#f59e0b' },
  'in-progress': { label: 'In Progress', color: '#3b82f6' },
  'done':        { label: 'Done',        color: '#22c55e' },
};

export default function TodoList() {
  const { filteredTasks, updateTask, deleteTask, addToCalendar, filter, setFilter, sort, setSort, loading } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
        Loading tasks...
      </div>
    );
  }

  return (
    <div>
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10,
        alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {/* Status filter */}
          <select
            value={filter.status}
            onChange={e => setFilter({ status: e.target.value })}
            style={selectStyle}
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {/* Platform filter */}
          <select
            value={filter.platform}
            onChange={e => setFilter({ platform: e.target.value })}
            style={selectStyle}
          >
            <option value="all">All Platforms</option>
            {['instagram','twitter','linkedin','facebook','tiktok','youtube','general'].map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={filter.priority}
            onChange={e => setFilter({ priority: e.target.value })}
            style={selectStyle}
          >
            <option value="all">All Priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={selectStyle}
          >
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="created">Sort: Newest</option>
          </select>
        </div>

        <button
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          style={{
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          + New Task
        </button>
      </div>

      {/* ── Task Form ─────────────────────────────────────────────────────── */}
      {showForm && (
        <TaskForm
          initialData={editingTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}

      {/* ── Task List ─────────────────────────────────────────────────────── */}
      {filteredTasks.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 60,
          color: '#64748b', background: '#1e293b',
          borderRadius: 12, border: '1px solid #334155',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: '1rem', marginBottom: 6 }}>No tasks yet!</div>
          <div style={{ fontSize: '0.8rem' }}>Create your first social media task above.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              expanded={expandedId === task.id}
              onToggleExpand={() => setExpandedId(id => id === task.id ? null : task.id)}
              onEdit={() => { setEditingTask(task); setShowForm(true); }}
              onDelete={() => deleteTask(task.id)}
              onStatusChange={(status) => updateTask(task.id, { status })}
              onAddToCalendar={() => addToCalendar(task)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, expanded, onToggleExpand, onEdit, onDelete, onStatusChange, onAddToCalendar }) {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG['todo'];
  const isDone = task.status === 'done';
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isDone;
  const dueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <div style={{
      background: '#1e293b',
      border: `1px solid ${isOverdue ? '#ef444433' : '#334155'}`,
      borderLeft: `4px solid ${isOverdue ? '#ef4444' : priority.color}`,
      borderRadius: 10,
      padding: '14px 18px',
      opacity: isDone ? 0.65 : 1,
      transition: 'opacity 0.2s',
    }}>
      <div
        style={{
          display: 'flex', alignItems: 'flex-start',
          gap: 12, cursor: 'pointer',
        }}
        onClick={onToggleExpand}
      >
        {/* Status toggle */}
        <button
          onClick={e => {
            e.stopPropagation();
            const cycle = { 'todo': 'in-progress', 'in-progress': 'done', 'done': 'todo' };
            onStatusChange(cycle[task.status]);
          }}
          style={{
            width: 22, height: 22, borderRadius: '50%',
            border: `2px solid ${status.color}`,
            background: isDone ? status.color : 'transparent',
            cursor: 'pointer', flexShrink: 0, marginTop: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title="Click to cycle status"
        >
          {isDone && <span style={{ color: '#fff', fontSize: '0.7rem' }}>✓</span>}
        </button>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#e2e8f0',
              textDecoration: isDone ? 'line-through' : 'none',
            }}>
              {task.title}
            </span>
            <PlatformBadge platform={task.platform} />
            <span style={{
              fontSize: '0.7rem', color: priority.color,
              background: priority.color + '22',
              borderRadius: 4, padding: '1px 6px',
            }}>
              {priority.emoji} {priority.label}
            </span>
            {task.contentType && task.contentType !== 'post' && (
              <span style={{
                fontSize: '0.68rem', color: '#94a3b8',
                background: '#33415522', borderRadius: 4, padding: '1px 6px',
              }}>
                {task.contentType}
              </span>
            )}
            {isOverdue && (
              <span style={{
                fontSize: '0.68rem', color: '#ef4444',
                background: '#ef444422', borderRadius: 4, padding: '1px 6px', fontWeight: 600,
              }}>
                🚨 OVERDUE
              </span>
            )}
            {dueToday && !isDone && (
              <span style={{
                fontSize: '0.68rem', color: '#f59e0b',
                background: '#f59e0b22', borderRadius: 4, padding: '1px 6px', fontWeight: 600,
              }}>
                📅 DUE TODAY
              </span>
            )}
          </div>

          {task.dueDate && (
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              📅 {format(new Date(task.dueDate), 'MMM d, yyyy · h:mm a')}
            </div>
          )}
        </div>

        {/* Status pill */}
        <span style={{
          background: status.color + '22',
          color: status.color,
          border: `1px solid ${status.color}33`,
          borderRadius: 20, padding: '2px 10px',
          fontSize: '0.7rem', fontWeight: 600,
          flexShrink: 0,
        }}>
          {status.label}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: '1px solid #334155',
        }}>
          {task.description && (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 10 }}>
              {task.description}
            </p>
          )}
          {task.hashtags?.length > 0 && (
            <div style={{ fontSize: '0.78rem', color: '#6366f1', marginBottom: 10 }}>
              {task.hashtags.map(h => `#${h}`).join(' ')}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <ActionButton onClick={onEdit} color="#6366f1" emoji="✏️" label="Edit" />
            <ActionButton onClick={onAddToCalendar} color="#22c55e" emoji="📅" label={task.calendarEventId ? 'In Calendar ✓' : 'Add to Calendar'} />
            <ActionButton onClick={onDelete} color="#ef4444" emoji="🗑️" label="Delete" />
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ onClick, color, emoji, label }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        background: color + '22',
        color,
        border: `1px solid ${color}44`,
        borderRadius: 6,
        padding: '6px 14px',
        cursor: 'pointer',
        fontSize: '0.78rem',
        fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 5,
      }}
    >
      {emoji} {label}
    </button>
  );
}

const selectStyle = {
  background: '#0f172a',
  color: '#94a3b8',
  border: '1px solid #334155',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: '0.8rem',
  cursor: 'pointer',
};
