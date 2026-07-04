const { admin, db } = require('../config/firebaseAdmin');

/**
 * Service to dispatch emergency alerts to a sender's trusted contacts.
 * 
 * @param {string} senderUid - Firebase UID of the emergency sender
 * @param {string} alertId - ID of the active emergency alert
 * @returns {Promise<object>} - Stats of the dispatch run
 */
async function sendAlertNotifications(senderUid, alertId) {
  if (!db || !admin) {
    throw new Error('Firebase Admin/Firestore is not initialized');
  }

  console.log('[ALERT] Emergency request received');

  // 1. Validate sender
  const senderDocRef = db.collection('users').doc(senderUid);
  const senderDocSnap = await senderDocRef.get();

  if (!senderDocSnap.exists) {
    console.error(`[ALERT] Sender user not found for UID: ${senderUid}`);
    const error = new Error(`Sender user not found for UID: ${senderUid}`);
    error.statusCode = 404;
    throw error;
  }

  console.log('[ALERT] Sender located');
  const senderData = senderDocSnap.data();
  const senderName = senderData.name || 'A user';

  // 2. Load trusted contacts
  console.log('[ALERT] Loading trusted contacts');
  const contactsCollectionRef = db.collection('users').doc(senderUid).collection('trustedContacts');
  const contactsSnap = await contactsCollectionRef.get();

  const contactsFound = contactsSnap.size;
  console.log(`[ALERT] ${contactsFound} trusted contacts found`);

  if (contactsFound === 0) {
    console.log('[ALERT] Dispatch completed');
    return {
      success: true,
      contactsFound: 0,
      validTokens: 0,
      notificationsSent: 0,
      failedNotifications: 0
    };
  }

  console.log('[ALERT] Resolving device tokens');

  let validTokens = 0;
  let notificationsSent = 0;
  let failedNotifications = 0;

  // Resolve users & device tokens for all contacts
  const targetTokens = [];
  const contactsList = contactsSnap.docs;

  for (let i = 0; i < contactsList.length; i++) {
    const contactDoc = contactsList[i];
    const contactData = contactDoc.data();
    
    // Skip if explicitly disabled
    if (contactData.enabled === false) {
      continue;
    }

    try {
      let resolvedUser = null;

      // Try resolving via direct uid/contactUid (Preferred Strategy)
      const targetUid = contactData.uid || contactData.contactUid;
      if (targetUid && typeof targetUid === 'string' && targetUid.trim()) {
        const userSnap = await db.collection('users').doc(targetUid.trim()).get();
        if (userSnap.exists) {
          resolvedUser = userSnap.data();
        }
      }

      // Try resolving via document ID (if document ID is set to the contact's UID)
      if (!resolvedUser && contactDoc.id && contactDoc.id.length >= 20 && !contactDoc.id.includes('/')) {
        const userSnap = await db.collection('users').doc(contactDoc.id).get();
        if (userSnap.exists) {
          resolvedUser = userSnap.data();
        }
      }

      // Fallback Strategy: Resolve via phone matching.
      // Used for legacy contacts that only contain names and phone numbers without authentication UIDs.
      // Searches the global 'users' collection to locate the user who registered with this phone number.
      if (!resolvedUser && contactData.phone && typeof contactData.phone === 'string' && contactData.phone.trim()) {
        const usersSnap = await db.collection('users').where('phone', '==', contactData.phone.trim()).get();
        if (!usersSnap.empty) {
          resolvedUser = usersSnap.docs[0].data();
        }
      }

      const fcmToken = resolvedUser?.device?.fcmToken;

      if (fcmToken && typeof fcmToken === 'string' && fcmToken.trim()) {
        validTokens++;
        targetTokens.push({
          token: fcmToken,
          index: i + 1
        });
      }
    } catch (resolveErr) {
      console.warn(`[ALERT] Error resolving contact index ${i + 1} (${contactDoc.id}):`, resolveErr.message);
    }
  }

  // 4. Dispatch messages
  for (const target of targetTokens) {
    const { token, index } = target;
    const maskedToken = token.length > 16 
      ? `${token.substring(0, 8)}...${token.substring(token.length - 8)}`
      : '***';

    console.log(`[FCM] Sending notification to contact ${index}`);

    const message = {
      notification: {
        title: '🚨 Emergency Alert',
        body: `${senderName} may require immediate assistance.`
      },
      data: {
        type: 'emergency',
        senderUid,
        alertId,
        timestamp: new Date().toISOString()
      },
      token
    };

    try {
      const messageId = await admin.messaging().send(message);
      console.log('[FCM] Notification accepted');
      console.log(`[FCM] Message ID: ${messageId}`);
      notificationsSent++;
    } catch (sendErr) {
      console.error(`[FCM] Failed to notify contact ${index}:`, sendErr.message);
      failedNotifications++;
    }
  }

  console.log('[ALERT] Dispatch completed');

  return {
    success: true,
    contactsFound,
    validTokens,
    notificationsSent,
    failedNotifications
  };
}

module.exports = {
  sendAlertNotifications
};
