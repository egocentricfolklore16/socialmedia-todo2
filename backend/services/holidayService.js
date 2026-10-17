const { google } = require('googleapis');
const { getTokens } = require('./store');
const { getAuthenticatedClient } = require('./googleAuth');
const { sendPushToAll } = require('./pushService');

// How many days ahead to warn about holidays
const LOOKAHEAD_DAYS = 3;

/**
 * Fetch holidays from the user's Google Calendar for the next N days.
 * Uses the "en.#country##holiday@group.v.calendar.google.com" public
 * calendar IDs.  We also scan the user's own calendar for all-day
 * events flagged as holidays.
 *
 * @returns {Array} holiday event objects
 */
async function fetchUpcomingHolidays() {
  const tokens = getTokens();
  if (!tokens) {
    console.log('[Holiday] No Google tokens stored — skipping holiday check.');
    return [];
  }

  const auth = getAuthenticatedClient(tokens);
  const calendar = google.calendar({ version: 'v3', auth });

  const now = new Date();
  const timeMax = new Date(now);
  timeMax.setDate(timeMax.getDate() + LOOKAHEAD_DAYS);

  // Public holiday calendar IDs (add more as needed)
  const holidayCalendarIds = [
    'en.usa#holiday@group.v.calendar.google.com',          // US
    'en.uk#holiday@group.v.calendar.google.com',           // UK
    'en.christian#holiday@group.v.calendar.google.com',    // Christian
    'en.gh#holiday@group.v.calendar.google.com',           // Ghana
    'en.ng#holiday@group.v.calendar.google.com',           // Nigeria
  ];

  const allHolidays = [];

  for (const calId of holidayCalendarIds) {
    try {
      const res = await calendar.events.list({
        calendarId: calId,
        timeMin: now.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });
      if (res.data.items?.length) {
        allHolidays.push(...res.data.items);
      }
    } catch (err) {
      // Calendar might not be accessible — silently skip
      if (err.code !== 404 && err.code !== 403) {
        console.warn(`[Holiday] Could not fetch from ${calId}:`, err.message);
      }
    }
  }

  // Deduplicate by summary + date
  const seen = new Set();
  return allHolidays.filter(event => {
    const key = `${event.summary}|${event.start?.date || event.start?.dateTime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Main entry point — called by cron and on server start.
 * Fetches holidays and fires push notifications.
 */
async function checkHolidaysAndNotify() {
  try {
    const holidays = await fetchUpcomingHolidays();
    if (holidays.length === 0) {
      console.log('[Holiday] No upcoming holidays found.');
      return;
    }

    console.log(`[Holiday] Found ${holidays.length} upcoming holiday(s).`);

    for (const holiday of holidays) {
      const startDate = holiday.start?.date || holiday.start?.dateTime;
      const formattedDate = startDate
        ? new Date(startDate).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric',
          })
        : 'soon';

      await sendPushToAll({
        title: `🎉 Holiday: ${holiday.summary}`,
        body: `Coming up on ${formattedDate}! Plan your social media posts in advance.`,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: `holiday-${holiday.id}`,
        url: '/?tab=calendar',
        data: {
          type: 'holiday',
          holidayName: holiday.summary,
          date: startDate,
        },
      });
    }
  } catch (err) {
    console.error('[Holiday] Error during holiday check:', err.message);
  }
}

module.exports = { checkHolidaysAndNotify, fetchUpcomingHolidays };
