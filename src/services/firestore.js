const { Firestore } = require('@google-cloud/firestore');
const path = require('path');

const firestore = new Firestore({
  projectId: 'ta-adit-final',
  keyFilename: path.resolve(__dirname, '../../service-account.json'),
});
module.exports = { db: firestore };
