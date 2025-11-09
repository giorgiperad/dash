const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (reuse same function as portfolio.js)
function getDatabase() {
  if (!admin.apps.length) {
    try {
      // Check for required environment variables
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

      // Handle private key - Vercel environment variables may have different formats
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Replace escaped newlines (common when pasting into Vercel)
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      
      // If the key doesn't start with -----BEGIN, it might be missing newlines
      if (!privateKey.includes('-----BEGIN')) {
        throw new Error('FIREBASE_PRIVATE_KEY appears to be malformed. It should start with "-----BEGIN PRIVATE KEY-----"');
      }
      
      // Ensure proper formatting
      if (!privateKey.includes('\n') && privateKey.length > 100) {
        // Key might be on one line, try to add newlines around markers
        privateKey = privateKey
          .replace(/-----BEGIN PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----\n')
          .replace(/-----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----');
      }

      console.log('Initializing Firebase with project:', process.env.FIREBASE_PROJECT_ID);
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error.message);
      throw error;
    }
  }
  return admin.database();
}

// Admin email - should match the one in index.html (currently: testireba5@gmail.com)
// Change this if you want to use a different admin email
const ADMIN_EMAIL = 'testireba5@gmail.com';

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Initialize Firebase Admin (if not already initialized)
    getDatabase(); // This ensures Firebase Admin is initialized
    
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - Missing or invalid token' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (authError) {
      console.error('Token verification error:', authError.message);
      return res.status(401).json({ error: 'Unauthorized - Invalid token', details: authError.message });
    }

    // Check if user is admin
    if (decodedToken.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    // Get token ID from request body
    const { id } = req.body;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({ error: 'Missing or invalid token ID' });
    }

    const tokenId = id.trim().toLowerCase();
    console.log(`Admin ${decodedToken.email} attempting to add token: ${tokenId}`);

    // Verify token exists on CoinGecko
    try {
      const coingeckoResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`
      );
      
      if (!coingeckoResponse.ok) {
        if (coingeckoResponse.status === 404) {
          return res.status(404).json({ error: `Token "${tokenId}" not found on CoinGecko. Please check the CoinGecko ID.` });
        }
        throw new Error(`CoinGecko API error: ${coingeckoResponse.status}`);
      }
      
      const coinData = await coingeckoResponse.json();
      console.log(`Verified token on CoinGecko: ${coinData.name} (${coinData.symbol})`);
    } catch (coingeckoError) {
      console.error('CoinGecko verification error:', coingeckoError.message);
      return res.status(500).json({ 
        error: 'Failed to verify token on CoinGecko',
        message: coingeckoError.message
      });
    }

    // Add token to Firebase
    const db = getDatabase();
    const tokensRef = db.ref('tokens');
    
    // Check if token already exists
    const snapshot = await tokensRef.once('value');
    const existingTokens = snapshot.val() || {};
    const tokenExists = Object.values(existingTokens).some(t => t.id === tokenId);
    
    if (tokenExists) {
      return res.status(409).json({ error: `Token "${tokenId}" already exists in the database` });
    }

    // Add new token
    const newTokenRef = tokensRef.push();
    await newTokenRef.set({
      id: tokenId,
      addedAt: admin.database.ServerValue.TIMESTAMP,
      addedBy: decodedToken.email
    });

    console.log(`Successfully added token: ${tokenId}`);
    
    res.status(200).json({ 
      success: true,
      message: `Token "${tokenId}" added successfully`,
      tokenId: tokenId
    });

  } catch (error) {
    console.error('Token API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred'
    });
  }
};

