const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firestoreInstance = null;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Check if credentials are provided via direct environment variables (preferred for production)
if (projectId && clientEmail && privateKey) {
  try {
    if (!admin.apps.length) {
      // Correctly handle escaped newlines in the private key
      const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey
        })
      });
      console.log('[Firebase Admin] Initialized successfully using environment variables.');
    }
    firestoreInstance = admin.firestore();
  } catch (error) {
    console.error('[Firebase Admin] Initialization failed using environment variables:', error.message);
  }
} else {
  // Local fallback: Load from service account path (if defined)
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountPath) {
    console.error('[Firebase Admin] Error: Firebase credentials are not configured in environment variables.');
  } else {
    try {
      const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`File does not exist at resolved path: ${resolvedPath}`);
      }

      const serviceAccount = require(resolvedPath);
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('[Firebase Admin] Initialized successfully using credentials.');
      }
      firestoreInstance = admin.firestore();
    } catch (error) {
      console.error('[Firebase Admin] Initialization failed using credentials file:', error.message);
    }
  }
}

module.exports = {
  admin,
  firestore: firestoreInstance,
  db: firestoreInstance
};
