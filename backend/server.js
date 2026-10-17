require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const calendarRoutes = require('./routes/calendar');
const notificationsRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');
const { checkHolidaysAndNotify } = require('./services/holidayService');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Cron Jobs ────────────────────────────────────────────────────────────────
// Check for upcoming holidays every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Running daily holiday check...');
  await checkHolidaysAndNotify();
});

// Also check on server startup for same-day / next-day holidays
checkHolidaysAndNotify().catch(console.error);

// ── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 SocialTodo Backend running on http://localhost:${PORT}`);
  console.log(`📅 Google Calendar integration: active`);
  console.log(`🔔 Push notifications: active\n`);
});
