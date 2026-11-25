// Example Vercel Serverless Function: /api/push.js
// ใช้สำหรับยิง Push Notification จากหลังบ้านหรือ Vercel เข้ามือถือของผู้ใช้

const webpush = require('web-push');

// คุณสามารถสร้าง VAPID keys ได้ด้วยคำสั่ง: npx web-push generate-vapid-keys
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'YOUR_PUBLIC_VAPID_KEY';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'YOUR_PRIVATE_VAPID_KEY';

webpush.setVapidDetails(
  'mailto:admin@campusschedule.app',
  publicVapidKey,
  privateVapidKey
);

module.exports = async (req, res) => {
  // Support GET request for browser health check and cron-job.org testing
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      message: 'CampusSchedule Push Notification API is active!',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subscription, title, body, url } = req.body;

  if (!subscription) {
    return res.status(400).json({ error: 'Missing push subscription object' });
  }

  const payload = JSON.stringify({
    title: title || 'แจ้งเตือนตารางเรียน',
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
