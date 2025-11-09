const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
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
        throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
      }

      // Handle private key - Vercel environment variables may have different formats
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Replace escaped newlines (common when pasting into Vercel)
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      
      // If the key doesn't start with -----BEGIN, it might be missing newlines
      // Try to reconstruct it if it's all on one line
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
      console.error('Error details:', {
        hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
        privateKeyStartsWith: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30) || 'N/A',
        hasDatabaseURL: !!process.env.FIREBASE_DATABASE_URL,
      });
      throw error;
    }
  }
  return admin.database();
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const db = getDatabase();
    const snap = await db.ref('tokens').once('value');
    const tokensData = snap.val() || {};
    const tokens = Object.values(tokensData).map(t => t.id).filter(Boolean);

    if (!tokens.length) {
      return res.json({ cryptoData: [], globalData: null, fearGreed: null });
    }

    const ids = tokens.join(',');
    const [market, global, fg] = await Promise.all([
      fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`).then(r => {
        if (!r.ok) throw new Error(`CoinGecko API error: ${r.status}`);
        return r.json();
      }),
      fetch('https://api.coingecko.com/api/v3/global').then(r => {
        if (!r.ok) throw new Error(`CoinGecko Global API error: ${r.status}`);
        return r.json();
      }),
      fetch('https://api.alternative.me/fng/').then(r => {
        if (!r.ok) throw new Error(`Fear & Greed API error: ${r.status}`);
        return r.json();
      })
    ]);

    res.json({
      cryptoData: market || [],
      globalData: global?.data || null,
      fearGreed: fg?.data?.[0] || null
    });
  } catch (error) {
    console.error('Portfolio API error:', error);
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Internal server error';
    let errorDetails = {};
    
    if (error.message?.includes('Firebase') || error.message?.includes('FIREBASE')) {
      errorDetails = {
        hint: 'Check your Firebase environment variables in Vercel dashboard',
        commonIssues: [
          'FIREBASE_PRIVATE_KEY should include the full key with BEGIN/END markers',
          'Private key newlines should be preserved (use \\n or actual newlines)',
          'Ensure all Firebase credentials are correctly set in Vercel environment variables'
        ]
      };
    }
    
    res.status(500).json({ 
      error: errorMessage,
      ...errorDetails,
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    });
  }
}