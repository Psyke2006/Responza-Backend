const { admin, db } = require('../config/firebaseAdmin');

/**
 * Service to send a test FCM push notification.
 * 
 * @param {string} uid - Firebase user ID to load FCM token for
 * @returns {Promise<string>} - Resolves to the Firebase Messaging message ID string
 */
async function sendTestNotification(uid) {
  if (!db || !admin) {
    throw new Error('Firebase Admin/Firestore is not initialized');
  }

  // Load the user document from Firestore
  console.log('[FCM] Loading device token...');
  const userDocRef = db.collection('users').doc(uid);
  const userDocSnap = await userDocRef.get();

  if (!userDocSnap.exists) {
    const error = new Error(`User document not found for UID: ${uid}`);
    error.statusCode = 404;
    throw error;
  }

  console.log('[FCM] User located');

  const userData = userDocSnap.data();
  const fcmToken = userData?.device?.fcmToken;

  if (!fcmToken || typeof fcmToken !== 'string' || !fcmToken.trim()) {
    const error = new Error(`No registered FCM token found for user UID: ${uid}`);
    error.statusCode = 400;
    throw error;
  }

  const maskedToken = fcmToken.length > 16 
    ? `${fcmToken.substring(0, 8)}...${fcmToken.substring(fcmToken.length - 8)}`
    : '***';
  console.log(`[FCM] Device token located: ${maskedToken}`);

  console.log('[FCM] Preparing payload');

  // Build the FCM notification payload
  const message = {
    notification: {
      title: 'Responza Test Notification',
      body: 'Firebase Cloud Messaging is working successfully.'
    },
    data: {
      type: 'test',
      timestamp: new Date().toISOString()
    },
    token: fcmToken
  };

  console.log('[FCM] Sending notification...');
  const messageId = await admin.messaging().send(message);
  
  console.log('[FCM] Firebase accepted notification');
  console.log(`[FCM] Message ID: ${messageId}`);
  console.log('[FCM] Notification request complete');

  return messageId;
}

module.exports = {
  sendTestNotification
};
