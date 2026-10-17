const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { getTokens } = require('../services/store');
const { getAuthenticatedClient } = require('../services/googleAuth');
const { fetchUpcomingHolidays } = require('../services/holidayService');

function getCalendarClient() {
  const tokens = getTokens();
  if (!tokens) throw new Error('Not authenticated with Google.');
  const auth = getAuthenticatedClient(tokens);
  return google.calendar({ version: 'v3', auth });
}

// ── GET /api/calendar/events ─────────────────────────────────────────────────
// Returns events for a given date range
router.get('/events', async (req, res) => {
  try {
    const calendar = getCalendarClient();
    const { start, end } = req.query;

    const timeMin = start ? new Date(start).toISOString() : new Date().toISOString();
    const timeMax = end
      ? new Date(end).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 200,
    });

    res.json(response.data.items || []);
  } catch (err) {
    console.error('[Calendar] Error fetching events:', err.message);
    res.status(err.message.includes('authenticated') ? 401 : 500)
      .json({ error: err.message });
  }
});

// ── POST /api/calendar/events ────────────────────────────────────────────────
// Create a new event (e.g., a scheduled social media post)
router.post('/events', async (req, res) => {
  try {
    const calendar = getCalendarClient();
    const {
      title,
      description = '',
      startDateTime,
      endDateTime,
      platform = 'general',
      taskId,
    } = req.body;

    if (!title || !startDateTime) {
      return res.status(400).json({ error: 'title and startDateTime are required.' });
    }

    // Compute end time: default to 1 hour after start if not provided
    const start = new Date(startDateTime);
    const end = endDateTime ? new Date(endDateTime) : new Date(start.getTime() + 60 * 60 * 1000);

    const event = {
      summary: `[${platform.toUpperCase()}] ${title}`,
      description: `${description}\n\n---\nCreated by SocialTodo${taskId ? ` | Task ID: ${taskId}` : ''}`,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      colorId: platformColorId(platform),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },   // 1 hour before
          { method: 'popup', minutes: 1440 },  // 1 day before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    res.status(201).json(response.data);
  } catch (err) {
    console.error('[Calendar] Error creating event:', err.message);
    res.status(err.message.includes('authenticated') ? 401 : 500)
      .json({ error: err.message });
  }
});

// ── DELETE /api/calendar/events/:eventId ─────────────────────────────────────
router.delete('/events/:eventId', async (req, res) => {
  try {
    const calendar = getCalendarClient();
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: req.params.eventId,
    });
    res.json({ message: 'Calendar event deleted.' });
  } catch (err) {
    console.error('[Calendar] Error deleting event:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/calendar/holidays ───────────────────────────────────────────────
router.get('/holidays', async (req, res) => {
  try {
    const holidays = await fetchUpcomingHolidays();
    res.json(holidays);
  } catch (err) {
    console.error('[Calendar] Error fetching holidays:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────
// Map social platform to Google Calendar color IDs
function platformColorId(platform) {
  const colors = {
    instagram: '6',  // Tangerine
    twitter: '9',    // Blueberry
    linkedin: '1',   // Lavender (close to LinkedIn blue)
    facebook: '9',   // Blueberry
    tiktok: '8',     // Graphite
    youtube: '11',   // Tomato
    general: '2',    // Sage
  };
  return colors[platform.toLowerCase()] || '2';
}

module.exports = router;
