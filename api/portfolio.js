import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
function getDatabase() {
  if (!admin.apps.length) {
    try {
      // Handle private key - replace escaped newlines if present
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey || !process.env.FIREBASE_DATABASE_URL) {
        throw new Error('Missing required Firebase environment variables');
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
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }
  return admin.database();
}

export default async function handler(req, res) {
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
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}