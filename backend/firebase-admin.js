// firebaseAdmin.js
const admin = require("firebase-admin");

const serviceAccount = require("./samplereact-32360-firebase-adminsdk-7ti8q-2b6932dc82.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
