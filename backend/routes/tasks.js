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
    dueDate,
    platform = 'general',  // instagram | twitter | linkedin | facebook | tiktok | general
    priority = 'medium',   // low | medium | high
    status = 'todo',       // todo | in-progress | done
    calendarEventId = null,
    hashtags = [],
    contentType = 'post',  // post | reel | story | thread | video
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const newTask = {
    id: uuidv4(),
    title: title.trim(),
    description,
    dueDate: dueDate || null,
    platform,
    priority,
    status,
    calendarEventId,
    hashtags,
    contentType,
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

  const updatedTask = {
    ...tasks[index],
    ...req.body,
    id: tasks[index].id,          // prevent id override
    createdAt: tasks[index].createdAt,
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
