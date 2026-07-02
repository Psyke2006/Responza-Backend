const { admin, db } = require('../config/firebaseAdmin');

/**
 * Register FCM device details for a user.
 * Merges fcmToken, platform and server timestamp into users/{uid} under a nested `device` map.
 * 
 * @param {string} uid - User ID
 * @param {string} fcmToken - FCM Token
 * @param {string} platform - Client platform (e.g., 'android')
 * @returns {Promise<void>}
 */
async function registerDevice(uid, fcmToken, platform) {
  if (!db || !admin) {
    throw new Error('Database connection is not initialized');
  }

  const docRef = db.collection('users').doc(uid);

  // Set the nested device map with merge: true to avoid deleting other fields of the user
  await docRef.set({
    device: {
      fcmToken,
      platform,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  }, { merge: true });
}

module.exports = {
  registerDevice
};
