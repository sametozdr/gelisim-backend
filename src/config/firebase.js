const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Usually, you place your service account JSON in the config folder
// or use environment variables for every field.
// For MVP, we point to a path defined in .env
try {
  const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_PRIVATE_KEY_PATH);
  
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
  // We don't exit process here so developer can fix the config
}

module.exports = admin;
