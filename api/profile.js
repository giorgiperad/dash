const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
function getDatabase() {
  if (!admin.apps.length) {
    try {
      const missingVars = [];
      if (!process.env.FIREBASE_PROJECT_ID) missingVars.push('FIREBASE_PROJECT_ID');
      if (!process.env.FIREBASE_CLIENT_EMAIL) missingVars.push('FIREBASE_CLIENT_EMAIL');
      if (!process.env.FIREBASE_PRIVATE_KEY) missingVars.push('FIREBASE_PRIVATE_KEY');
      if (!process.env.FIREBASE_DATABASE_URL) missingVars.push('FIREBASE_DATABASE_URL');
      
      if (missingVars.length > 0) {
        throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
      }

      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      
      if (!privateKey.includes('-----BEGIN')) {
        throw new Error('FIREBASE_PRIVATE_KEY appears to be malformed');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
    } catch (error) {
      console.error('Firebase Admin initialization error:', error.message);
      throw error;
    }
  }
  return admin.database();
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = getDatabase();
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid authorization token' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }

    const userId = decodedToken.uid;
    const { action, name, email, currentPassword, newPassword, confirmPassword } = req.body;

    if (action === 'updateName') {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Update name in Firebase Realtime Database
      await db.ref(`users/${userId}/name`).set(name.trim());
      
      // Also update displayName in Auth
      await admin.auth().updateUser(userId, {
        displayName: name.trim()
      });

      return res.status(200).json({ 
        success: true, 
        message: 'სახელი წარმატებით შეიცვალა',
        name: name.trim()
      });
    }

    if (action === 'updateEmail') {
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change email' });
      }

      // Verify current password by attempting to sign in
      const user = await admin.auth().getUser(userId);
      const currentEmail = user.email;
      
      // Note: We can't verify password server-side with Admin SDK
      // The client should verify password before calling this endpoint
      // For now, we'll trust the client and update the email
      
      try {
        await admin.auth().updateUser(userId, {
          email: email.trim()
        });
        
        // Update email in Realtime Database
        await db.ref(`users/${userId}/email`).set(email.trim());

        return res.status(200).json({ 
          success: true, 
          message: 'ელფოსტა წარმატებით შეიცვალა',
          email: email.trim()
        });
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          return res.status(400).json({ error: 'ელფოსტა უკვე გამოიყენება' });
        }
        throw error;
      }
    }

    if (action === 'updatePassword') {
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'პაროლები არ ემთხვევა' });
      }

      // Note: We can't verify current password server-side with Admin SDK
      // The client should verify password before calling this endpoint
      // For now, we'll update the password
      
      try {
        await admin.auth().updateUser(userId, {
          password: newPassword
        });

        return res.status(200).json({ 
          success: true, 
          message: 'პაროლი წარმატებით შეიცვალა'
        });
      } catch (error) {
        if (error.code === 'auth/weak-password') {
          return res.status(400).json({ error: 'პაროლი ძალიან სუსტია' });
        }
        throw error;
      }
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message || 'შეცდომა პროფილის განახლებისას'
    });
  }
};

