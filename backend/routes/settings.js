const express = require('express');
const router = express.Router();
const { getSettings, saveSettings } = require('../services/store');

// ── GET /api/settings ────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const settings = getSettings();
    res.json(settings);
  } catch (err) {
    console.error('[Settings] Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to retrieve user settings.' });
  }
});

// ── PATCH /api/settings ──────────────────────────────────────────────────────
router.patch('/', (req, res) => {
  try {
    const { defaultPlatform, timezone, notificationPreferences } = req.body;

    const updates = {};
    if (defaultPlatform && typeof defaultPlatform === 'string') {
      const allowedPlatforms = ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok', 'youtube', 'general'];
      if (!allowedPlatforms.includes(defaultPlatform.toLowerCase())) {
        return res.status(400).json({ error: `Invalid defaultPlatform. Allowed: ${allowedPlatforms.join(', ')}` });
      }
      updates.defaultPlatform = defaultPlatform.toLowerCase();
    }

    if (timezone && typeof timezone === 'string') {
      updates.timezone = timezone.trim();
    }

    if (notificationPreferences && typeof notificationPreferences === 'object') {
      updates.notificationPreferences = {
        holidayAlerts: Boolean(notificationPreferences.holidayAlerts),
        taskReminders: Boolean(notificationPreferences.taskReminders),
      };
    }

    const updatedSettings = saveSettings(updates);
    res.json(updatedSettings);
  } catch (err) {
    console.error('[Settings] Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update user settings.' });
  }
});

module.exports = router;
