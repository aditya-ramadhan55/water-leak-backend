const { Firestore } = require('@google-cloud/firestore');

// Gunakan default konfigurasi — Cloud Run akan baca dari GOOGLE_APPLICATION_CREDENTIALS
const firestore = new Firestore();

module.exports = { db: firestore };
