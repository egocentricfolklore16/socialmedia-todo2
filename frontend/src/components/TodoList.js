import React, { useState } from 'react';
import { format, isPast, isToday, isFuture } from 'date-fns';
import { useApp } from '../context/AppContext';
import TaskForm from './TaskForm';
import { PlatformBadge } from './PlatformBadge';
import {
  Plus,
  Search,
  Check,
  Calendar,
  Edit3,
  Trash2,
  AlertTriangle,
  Clock,
  Tag,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle2,
  Layers,
  Share2
} from 'lucide-react';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: 'var(--priority-high)' },
  medium: { label: 'Medium', color: 'var(--priority-medium)' },
  low:    { label: 'Low',    color: 'var(--priority-low)' },
};

const STATUS_CONFIG = {
  'todo':        { label: 'To Do',       color: 'var(--status-todo)' },
  'in-progress': { label: 'In Progress', color: 'var(--status-in-progress)' },
  'done':        { label: 'Done',        color: 'var(--status-done)' },
};

export default function TodoList() {
  const {
    filteredTasks,
    tasks,
    updateTask,
    deleteTask,
    addToCalendar,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    sort,
    setSort,
    loading
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Section collapse states
  const [collapsed, setCollapsed] = useState({
    overdue: false,
    today: false,
    upcoming: false,
    done: true, // done tasks collapsed by default
  });

  const toggleSection = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Group tasks
  const overdueTasks = filteredTasks.filter(
    t => t.status !== 'done' && t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))
  );
  const todayTasks = filteredTasks.filter(
    t => t.status !== 'done' && t.dueDate && isToday(new Date(t.dueDate))
  );
  const upcomingTasks = filteredTasks.filter(
    t => t.status !== 'done' && (!t.dueDate || (isFuture(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))))
  );
  const doneTasks = filteredTasks.filter(t => t.status === 'done');

  // Extract list of unique campaign tags for filter
  const uniqueCampaigns = Array.from(
    new Set(tasks.map(t => t.campaign).filter(Boolean))
  );

  if (loading && tasks.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton" style={{ height: 68, borderRadius: 'var(--radius-md)' }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* ── Toolbar & Filters ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
      }}>
        {/* Search & Filters group */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', flex: 1, minWidth: 280 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
            <Search size={15} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search posts, captions, tags..."
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px 8px 36px',
                fontSize: 'var(--text-xs)',
                outline: 'none',
              }}
            />
          </div>

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
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Campaign filter (if campaigns exist) */}
          {uniqueCampaigns.length > 0 && (
            <select
              value={filter.campaign}
              onChange={e => setFilter({ campaign: e.target.value })}
              style={selectStyle}
            >
              <option value="all">All Campaigns</option>
              {uniqueCampaigns.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

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

        {/* Primary Action Button */}
        <button
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          style={{
            background: 'var(--accent)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 'var(--text-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={16} strokeWidth={2.5} /> New Task
        </button>
      </div>

      {/* ── Task Form Modal/Drawer ────────────────────────────────────────── */}
      {showForm && (
        <TaskForm
          initialData={editingTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}

      {/* ── Task List Sections ─────────────────────────────────────────────── */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          hasFilter={tasks.length > 0}
          onCreate={() => { setEditingTask(null); setShowForm(true); }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Overdue Section */}
          {overdueTasks.length > 0 && (
            <TaskSection
              title="Overdue"
              icon={<AlertTriangle size={15} style={{ color: 'var(--priority-high)' }} />}
              count={overdueTasks.length}
              color="var(--priority-high)"
              isCollapsed={collapsed.overdue}
              onToggle={() => toggleSection('overdue')}
            >
              {overdueTasks.map(task => (
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
            </TaskSection>
          )}

          {/* Today Section */}
          {todayTasks.length > 0 && (
            <TaskSection
              title="Today"
              icon={<Clock size={15} style={{ color: 'var(--status-todo)' }} />}
              count={todayTasks.length}
              color="var(--status-todo)"
              isCollapsed={collapsed.today}
              onToggle={() => toggleSection('today')}
            >
              {todayTasks.map(task => (
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
            </TaskSection>
          )}

          {/* Upcoming Section */}
          {upcomingTasks.length > 0 && (
            <TaskSection
              title="Upcoming"
              icon={<Calendar size={15} style={{ color: 'var(--accent)' }} />}
              count={upcomingTasks.length}
              color="var(--accent)"
              isCollapsed={collapsed.upcoming}
              onToggle={() => toggleSection('upcoming')}
            >
              {upcomingTasks.map(task => (
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
            </TaskSection>
          )}

          {/* Done Section */}
          {doneTasks.length > 0 && (
            <TaskSection
              title="Completed"
              icon={<CheckCircle2 size={15} style={{ color: 'var(--status-done)' }} />}
              count={doneTasks.length}
              color="var(--status-done)"
              isCollapsed={collapsed.done}
              onToggle={() => toggleSection('done')}
            >
              {doneTasks.map(task => (
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
            </TaskSection>
          )}
        </div>
      )}
    </div>
  );
}

function TaskSection({ title, icon, count, color, isCollapsed, onToggle, children }) {
  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0 0 var(--space-2) 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
        }}
      >
        {isCollapsed ? <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
        {icon}
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'var(--text-sm)',
          color: 'var(--text-primary)',
        }}>
          {title}
        </span>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          color,
          background: `${color}18`,
          borderRadius: 'var(--radius-full)',
          padding: '1px 7px',
        }}>
          {count}
        </span>
      </button>

      {!isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 4 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, expanded, onToggleExpand, onEdit, onDelete, onStatusChange, onAddToCalendar }) {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG['todo'];
  const isDone = task.status === 'done';
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isDone && !isToday(new Date(task.dueDate));
  const dueToday = task.dueDate && isToday(new Date(task.dueDate)) && !isDone;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${isOverdue ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-default)'}`,
      borderLeft: `4px solid ${isOverdue ? 'var(--priority-high)' : priority.color}`,
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      opacity: isDone ? 0.7 : 1,
      transition: 'all var(--transition-fast)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
        }}
        onClick={onToggleExpand}
      >
        {/* Checkbox status toggle */}
        <button
          onClick={e => {
            e.stopPropagation();
            const cycle = { 'todo': 'in-progress', 'in-progress': 'done', 'done': 'todo' };
            onStatusChange(cycle[task.status]);
          }}
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: `2px solid ${isDone ? status.color : 'var(--border-hover)'}`,
            background: isDone ? status.color : 'transparent',
            cursor: 'pointer',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)',
          }}
          title="Click to cycle status"
        >
          {isDone && <Check size={12} strokeWidth={3} style={{ color: '#ffffff' }} />}
        </button>

        {/* Title and metadata */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: isDone ? 'line-through' : 'none',
            }}>
              {task.title}
            </span>

            <PlatformBadge platform={task.platform} />

            {/* Content Type Pill */}
            {task.contentType && task.contentType !== 'post' && (
              <span style={{
                fontSize: '0.68rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '1px 6px',
                fontWeight: 500,
              }}>
                {task.contentType}
              </span>
            )}

            {/* Campaign Tag Pill */}
            {task.campaign && (
              <span style={{
                fontSize: '0.68rem',
                color: 'var(--accent)',
                background: 'var(--accent-light)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--accent-border)',
                padding: '1px 6px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
              }}>
                <Tag size={10} /> {task.campaign}
              </span>
            )}
          </div>

          {/* Schedule Date */}
          {task.dueDate && (
            <div style={{
              fontSize: 'var(--text-xs)',
              color: isOverdue ? 'var(--priority-high)' : dueToday ? 'var(--status-todo)' : 'var(--text-muted)',
              marginTop: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: (isOverdue || dueToday) ? 600 : 400,
            }}>
              <Calendar size={12} />
              {format(new Date(task.dueDate), 'MMM d, yyyy  •  h:mm a')}
              {isOverdue && ' (Overdue)'}
              {dueToday && ' (Due Today)'}
            </div>
          )}
        </div>

        {/* Right side status pill & expand chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            background: `${status.color}15`,
            color: status.color,
            border: `1px solid ${status.color}30`,
            borderRadius: 'var(--radius-full)',
            padding: '2px 8px',
            fontSize: '0.68rem',
            fontWeight: 600,
          }}>
            {status.label}
          </span>

          <ChevronDown
            size={16}
            style={{
              color: 'var(--text-muted)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform var(--transition-fast)',
            }}
          />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          marginTop: 'var(--space-3)',
          paddingTop: 'var(--space-3)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {/* Caption Draft / Notes */}
          {task.notes && (
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
            }}>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <FileText size={12} /> CAPTION DRAFT / COPY
              </div>
              <p style={{
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                whiteSpace: 'pre-wrap',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {task.notes}
              </p>
            </div>
          )}

          {/* Asset Description */}
          {task.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', margin: 0 }}>
              {task.description}
            </p>
          )}

          {/* Hashtags */}
          {task.hashtags?.length > 0 && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 500 }}>
              {task.hashtags.map(h => `#${h}`).join(' ')}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            <ActionButton onClick={onEdit} color="var(--accent)" icon={<Edit3 size={13} />} label="Edit" />
            <ActionButton
              onClick={onAddToCalendar}
              color="var(--status-done)"
              icon={<Share2 size={13} />}
              label={task.calendarEventId ? 'Synced with GCal ✓' : 'Add to GCal'}
            />
            <ActionButton onClick={onDelete} color="var(--priority-high)" icon={<Trash2 size={13} />} label="Delete" />
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ onClick, color, icon, label }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        background: `${color}15`,
        color,
        border: `1px solid ${color}35`,
        borderRadius: 'var(--radius-xs)',
        padding: '5px 12px',
        cursor: 'pointer',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        transition: 'all var(--transition-fast)',
      }}
    >
      {icon} {label}
    </button>
  );
}

function EmptyState({ hasFilter, onCreate }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: 'var(--space-10) var(--space-6)',
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-default)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-3)',
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 'var(--radius-md)',
        background: 'var(--accent-light)',
        border: '1px solid var(--accent-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent)',
      }}>
        <Layers size={28} strokeWidth={1.5} />
      </div>

      <div style={{
        fontSize: 'var(--text-lg)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        color: 'var(--text-primary)',
      }}>
        {hasFilter ? 'No tasks found' : 'No social media tasks yet'}
      </div>

      <p style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        maxWidth: 360,
        lineHeight: 1.5,
        margin: 0,
      }}>
        {hasFilter
          ? 'Try adjusting your filters or search query to find what you are looking for.'
          : 'Plan, draft captions, and schedule social media content across all platforms.'}
      </p>

      {!hasFilter && (
        <button
          onClick={onCreate}
          style={{
            marginTop: 'var(--space-2)',
            background: 'var(--accent)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 20px',
            fontWeight: 600,
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Plus size={16} /> Create First Task
        </button>
      )}
    </div>
  );
}

const selectStyle = {
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 10px',
  fontSize: 'var(--text-xs)',
  cursor: 'pointer',
  outline: 'none',
};
