import { useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Converts a base64url VAPID public key string into a Uint8Array
 * required by the Push API.
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export function usePushNotifications() {
  useEffect(() => {
    registerPush();
  }, []);
}

async function registerPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[Push] Push notifications not supported in this browser.');
    return;
  }

  try {
    // Wait for SW to be ready
    const registration = await navigator.serviceWorker.ready;

    // Check existing subscription
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      // Re-send to backend in case server restarted
      await axios.post('/api/notifications/subscribe', existing).catch(() => {});
      return;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[Push] Notification permission denied.');
      return;
    }

    // Fetch VAPID public key
    const { data } = await axios.get('/api/notifications/vapid-public-key');
    const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // Register with backend
    await axios.post('/api/notifications/subscribe', subscription);
    toast.success('🔔 Holiday & post reminders are on!', { duration: 3000 });
    console.log('[Push] Subscription registered.');

  } catch (err) {
    console.error('[Push] Registration error:', err);
  }
}
