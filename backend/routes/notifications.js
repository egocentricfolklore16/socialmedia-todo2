const express = require('express');
const router = express.Router();
const { addSubscription, removeSubscription } = require('../services/store');
const { sendPushToAll } = require('../services/pushService');

// ── GET /api/notifications/vapid-public-key ──────────────────────────────────
// Returns the VAPID public key so the frontend can subscribe
router.get('/vapid-public-key', (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return res.status(500).json({ error: 'VAPID public key not configured.' });
  }
  res.json({ publicKey: key });
});

// ── POST /api/notifications/subscribe ───────────────────────────────────────
router.post('/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription?.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object.' });
  }
  addSubscription(subscription);
  console.log('[Push] New subscription registered:', subscription.endpoint.slice(0, 60) + '...');
  res.status(201).json({ message: 'Subscribed successfully.' });
});

// ── POST /api/notifications/unsubscribe ─────────────────────────────────────
router.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ error: 'endpoint is required.' });
  }
  removeSubscription(endpoint);
  res.json({ message: 'Unsubscribed successfully.' });
});

// ── POST /api/notifications/test ─────────────────────────────────────────────
// Sends a test notification to verify setup
router.post('/test', async (req, res) => {
  try {
    await sendPushToAll({
      title: '🎉 SocialTodo Notifications Active!',
      body: 'You\'ll now receive holiday alerts and post reminders.',
      icon: '/logo192.png',
      tag: 'test-notification',
      url: '/',
    });
    res.json({ message: 'Test notification sent.' });
  } catch (err) {
    console.error('[Push] Test notification failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
