// Vercel Serverless Function: /api/push.js
// Handles Web Push Notifications and Health Checks

const webpush = require('web-push');

// Default generated VAPID keys (can be overridden via Vercel Environment Variables)
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BLvE8hkx_h7vufFs2c-Gcs2CuvLc-nUhJ4lnpQEiGV_oQ8d4mAr-Cpn6ymiEZqsXHr7bvj3Sqqv6Bk6eZ2Y--tE';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'dGAD7oM3WyjX_Rbh9-L-2a1XpQc5EABWTlLa5vWooZA';

try {
  webpush.setVapidDetails(
    'mailto:admin@campusschedule.app',
    publicVapidKey,
    privateVapidKey
  );
} catch (err) {
  console.warn('VAPID setup warning:', err.message);
}

module.exports = async (req, res) => {
  // 1. Health Check (GET request from browser or cron-job.org)
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      service: 'CampusSchedule Notification API',
      message: 'Push notification service is active and ready!',
      publicKey: publicVapidKey,
      timestamp: new Date().toISOString()
    });
  }

  // 2. Push Notification Trigger (POST request)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subscription, title, body, url } = req.body || {};

  if (!subscription) {
    return res.status(400).json({ error: 'Missing push subscription object in request body' });
  }

  const payload = JSON.stringify({
    title: title || 'แจ้งเตือนตารางเรียน 🔔',
    body: body || 'มีการอัปเดตคาบเรียนหรือกิจกรรมใหม่!',
    icon: './icon-192.png',
    badge: './icon-192.png',
    url: url || './index.html'
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return res.status(200).json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
