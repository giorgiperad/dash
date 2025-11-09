const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin SDK (reuse the same function pattern)
function getDatabase() {
  if (!admin.apps.length) {
    try {
      const missingVars = [];
      if (!process.env.FIREBASE_PROJECT_ID) missingVars.push('FIREBASE_PROJECT_ID');
      if (!process.env.FIREBASE_CLIENT_EMAIL) missingVars.push('FIREBASE_CLIENT_EMAIL');
      if (!process.env.FIREBASE_PRIVATE_KEY) missingVars.push('FIREBASE_PRIVATE_KEY');
      if (!process.env.FIREBASE_DATABASE_URL) missingVars.push('FIREBASE_DATABASE_URL');
      
      if (missingVars.length > 0) {
        const errorMsg = `Missing required Firebase environment variables: ${missingVars.join(', ')}. Please set these in Vercel Dashboard → Settings → Environment Variables.`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      if (!privateKey.includes('-----BEGIN')) {
        throw new Error('FIREBASE_PRIVATE_KEY appears to be malformed. It should start with "-----BEGIN PRIVATE KEY-----"');
      }
      if (!privateKey.includes('\n') && privateKey.length > 100) {
        privateKey = privateKey
          .replace(/-----BEGIN PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----\n')
          .replace(/-----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    } catch (error) {
      console.error('Firebase initialization error in /api/alerts:', error.message);
      throw error;
    }
  }
  return admin.database();
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Initialize Firebase Admin
  getDatabase();

  try {
    // Verify authentication for all methods
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - Missing or invalid token' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch (authError) {
      console.error('Token verification error:', authError.message);
      return res.status(401).json({ error: 'Unauthorized - Invalid token', details: authError.message });
    }

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;
    const db = getDatabase();
    const userAlertsRef = db.ref(`users/${userId}/alerts`);

    // GET - Fetch user alerts
    if (req.method === 'GET') {
      const snapshot = await userAlertsRef.once('value');
      const alerts = snapshot.val() || {};
      return res.status(200).json(alerts);
    }

    // POST - Add new alert
    if (req.method === 'POST') {
      const { alert } = req.body;
      if (!alert || !alert.tokenId || !alert.target || !alert.condition) {
        return res.status(400).json({ error: 'Missing required fields: tokenId, target, condition' });
      }

      const newAlertRef = userAlertsRef.push();
      await newAlertRef.set({
        tokenId: alert.tokenId.toLowerCase(),
        target: parseFloat(alert.target),
        condition: alert.condition, // 'above' or 'below'
        message: alert.message || '',
        createdAt: admin.database.ServerValue.TIMESTAMP,
        createdBy: userEmail
      });

      console.log(`User ${userEmail} added alert: ${alert.tokenId} ${alert.condition} $${alert.target}`);
      return res.status(200).json({ success: true, message: 'Alert added successfully' });
    }

    // DELETE - Remove alert
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing required parameter: id' });
      }

      const alertRef = userAlertsRef.child(id);
      const snapshot = await alertRef.once('value');
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      await alertRef.remove();
      console.log(`User ${userEmail} deleted alert ${id}`);
      return res.status(200).json({ success: true, message: 'Alert deleted successfully' });
    }

    // Method not supported
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in /api/alerts:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    });
  }
};

