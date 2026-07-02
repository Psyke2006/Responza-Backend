const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firestoreInstance = null;

// Read the service account path from the environment variable
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountPath) {
  console.error('[Firebase Admin] Error: FIREBASE_SERVICE_ACCOUNT environment variable is not defined.');
} else {
  try {
    // Resolve the path relative to the process working directory
    const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
    
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File does not exist at resolved path: ${resolvedPath}`);
    }

    // Load the service account configuration
    const serviceAccount = require(resolvedPath);

    // Initialize Firebase Admin only once
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('[Firebase Admin] Initialized successfully using credentials.');
    }

    firestoreInstance = admin.firestore();
  } catch (error) {
    console.error('[Firebase Admin] Initialization failed:', error.message);
  }
}

module.exports = {
  admin,
  firestore: firestoreInstance,
  db: firestoreInstance
};
