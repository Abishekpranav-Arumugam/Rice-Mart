// D:\Rice Mart\Consultancy-Project\exp-10\backend\middleware\auth.js
const admin = require('../firebase-admin'); // Or the correct relative path to firebase-admin.js

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error("AuthMiddleware: No token provided or not Bearer token.");
    return res.status(401).json({ message: 'Unauthorized: No token provided or malformed token.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  if (!idToken) {
    console.error("AuthMiddleware: Token is empty after splitting Bearer.");
    return res.status(401).json({ message: 'Unauthorized: Token is empty.' });
  }

  try {
    // console.log("AuthMiddleware: Attempting to verify token:", idToken.substring(0, 20) + "...");
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // console.log("AuthMiddleware: Token successfully verified. Decoded UID:", decodedToken.uid, "Email:", decodedToken.email);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("AuthMiddleware: Error verifying Firebase ID token:", error.code, error.message);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Unauthorized: Token expired.' });
    }
    if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    return res.status(401).json({ message: 'Unauthorized: Token verification failed.' });
  }
};

module.exports = authMiddleware;