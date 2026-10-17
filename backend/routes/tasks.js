const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getTasks, saveTasks } = require('../services/store');

// ── GET /api/tasks ──────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const tasks = getTasks();
  res.json(tasks);
});

// ── POST /api/tasks ─────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const {
    title,
    description = '',
    notes = '',
    campaign = '',
    tags = [],
    dueDate,
    platform = 'general',  // instagram | twitter | linkedin | facebook | tiktok | general | youtube
    priority = 'medium',   // low | medium | high
    status = 'todo',       // todo | in-progress | done
    calendarEventId = null,
    hashtags = [],
    contentType = 'post',  // post | reel | story | thread | video | live | newsletter
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const allowedPlatforms = ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok', 'youtube', 'general'];
  const allowedPriorities = ['low', 'medium', 'high'];
  const allowedStatuses = ['todo', 'in-progress', 'done'];

  const newTask = {
    id: uuidv4(),
    title: String(title).trim(),
    description: String(description || ''),
    notes: String(notes || ''),
    campaign: String(campaign || '').trim(),
    tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    platform: allowedPlatforms.includes(platform?.toLowerCase()) ? platform.toLowerCase() : 'general',
    priority: allowedPriorities.includes(priority?.toLowerCase()) ? priority.toLowerCase() : 'medium',
    status: allowedStatuses.includes(status?.toLowerCase()) ? status.toLowerCase() : 'todo',
    calendarEventId: calendarEventId || null,
    hashtags: Array.isArray(hashtags) ? hashtags.map(h => String(h).trim().replace(/^#/, '')).filter(Boolean) : [],
    contentType: String(contentType || 'post').toLowerCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const tasks = getTasks();
  tasks.push(newTask);
  saveTasks(tasks);

  res.status(201).json(newTask);
});

// ── PATCH /api/tasks/:id ────────────────────────────────────────────────────
router.patch('/:id', (req, res) => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const existing = tasks[index];
  const body = req.body;

  const allowedPlatforms = ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok', 'youtube', 'general'];
  const allowedPriorities = ['low', 'medium', 'high'];
  const allowedStatuses = ['todo', 'in-progress', 'done'];

  const updatedTask = {
    ...existing,
    ...body,
    id: existing.id,
    title: body.title !== undefined ? String(body.title).trim() : existing.title,
    description: body.description !== undefined ? String(body.description) : existing.description,
    notes: body.notes !== undefined ? String(body.notes) : (existing.notes || ''),
    campaign: body.campaign !== undefined ? String(body.campaign).trim() : (existing.campaign || ''),
    tags: body.tags !== undefined ? (Array.isArray(body.tags) ? body.tags.map(t => String(t).trim()).filter(Boolean) : []) : (existing.tags || []),
    platform: body.platform ? (allowedPlatforms.includes(body.platform.toLowerCase()) ? body.platform.toLowerCase() : existing.platform) : existing.platform,
    priority: body.priority ? (allowedPriorities.includes(body.priority.toLowerCase()) ? body.priority.toLowerCase() : existing.priority) : existing.priority,
    status: body.status ? (allowedStatuses.includes(body.status.toLowerCase()) ? body.status.toLowerCase() : existing.status) : existing.status,
    dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate).toISOString() : null) : existing.dueDate,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updatedTask;
  saveTasks(tasks);

  res.json(updatedTask);
});

// ── DELETE /api/tasks/:id ───────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== req.params.id);

  if (filtered.length === tasks.length) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  saveTasks(filtered);
  res.json({ message: 'Task deleted.' });
});

// ── GET /api/tasks/stats ────────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  const tasks = getTasks();
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    byPlatform: {},
    overdue: 0,
  };

  const now = new Date();
  for (const task of tasks) {
    // Count by platform
    stats.byPlatform[task.platform] = (stats.byPlatform[task.platform] || 0) + 1;
    // Count overdue
    if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'done') {
      stats.overdue++;
    }
  }

  res.json(stats);
});

module.exports = router;
