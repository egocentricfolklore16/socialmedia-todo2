const webpush = require('web-push');
const { getSubscriptions, removeSubscription } = require('./store');

// Configure VAPID details if valid keys are provided
if (process.env.VAPID_EMAIL && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    const subject = process.env.VAPID_EMAIL.startsWith('mailto:')
      ? process.env.VAPID_EMAIL
      : `mailto:${process.env.VAPID_EMAIL}`;
    webpush.setVapidDetails(
      subject,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (err) {
    console.warn('[Push] VAPID initialization skipped:', err.message);
  }
} else {
  console.warn('[Push] VAPID environment variables missing or incomplete.');
}

/**
 * Send a push notification to ALL registered subscriptions.
 * @param {object} payload - { title, body, icon, url, tag }
 */
async function sendPushToAll(payload) {
  const subscriptions = getSubscriptions();
  if (subscriptions.length === 0) {
    console.log('[Push] No subscriptions registered.');
    return;
  }

  const notification = JSON.stringify(payload);

  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification(sub, notification)
    )
  );

  results.forEach((result, idx) => {
    if (result.status === 'rejected') {
      const statusCode = result.reason?.statusCode;
      console.warn(`[Push] Failed for sub ${idx}: ${result.reason?.message}`);
      // Remove expired/invalid subscriptions (410 Gone)
      if (statusCode === 410 || statusCode === 404) {
        removeSubscription(subscriptions[idx].endpoint);
      }
    }
  });

  const sent = results.filter(r => r.status === 'fulfilled').length;
  console.log(`[Push] Sent to ${sent}/${subscriptions.length} subscribers.`);
}

module.exports = { sendPushToAll };
