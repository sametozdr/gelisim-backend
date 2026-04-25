const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Usually, you place your service account JSON in the config folder
// or use environment variables for every field.
// For MVP, we point to a path defined in .env
try {
  let serviceAccount;
  if (process.env.FIREBASE_CREDENTIALS) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  } else {
    const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_PRIVATE_KEY_PATH);
    serviceAccount = require(serviceAccountPath);
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
  // We don't exit process here so developer can fix the config
}

module.exports = admin;
