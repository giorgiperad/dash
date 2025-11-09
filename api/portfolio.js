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
      console.log('Using client email:', process.env.FIREBASE_CLIENT_EMAIL);
      
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Initialize Firebase Admin (if not already initialized)
  getDatabase(); // This ensures Firebase Admin is initialized

  // Handle GET - Fetch market data (existing functionality)
  if (req.method === 'GET') {
    try {
      console.log('Portfolio API called');
      
      // Try to get database - this will throw if Firebase is not configured
      let db;
      try {
        db = getDatabase();
        console.log('Database connection successful');
      } catch (firebaseError) {
        console.error('Firebase initialization failed:', firebaseError.message);
        return res.status(500).json({ 
          error: 'Firebase configuration error',
          message: firebaseError.message,
          hint: 'Check your Firebase environment variables in Vercel Dashboard → Settings → Environment Variables',
          requiredVars: ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_DATABASE_URL']
        });
      }

      // Fetch tokens from Firebase
      let tokens = [];
      try {
        const snap = await db.ref('tokens').once('value');
        const tokensData = snap.val() || {};
        tokens = Object.values(tokensData).map(t => t.id).filter(Boolean);
        console.log(`Found ${tokens.length} tokens in database`);
      } catch (dbError) {
        console.error('Database read error:', dbError.message);
        return res.status(500).json({ 
          error: 'Failed to read tokens from database',
          message: dbError.message
        });
      }

      // If no tokens, return empty data
      if (!tokens.length) {
        console.log('No tokens found, returning empty data');
        return res.json({ cryptoData: [], globalData: null, fearGreed: null });
      }

      // Fetch market data from CoinGecko
      const ids = tokens.join(',');
      console.log(`Fetching data for tokens: ${ids}`);
      
      let market, global, fg;
      try {
        [market, global, fg] = await Promise.all([
          fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; CryptoCollectiveX/1.0)'
            }
          }).then(async r => {
            if (r.status === 429) {
              // Rate limited - return cached data or empty array
              console.warn('CoinGecko rate limited (429), returning empty market data');
              return [];
            }
            if (!r.ok) throw new Error(`CoinGecko API error: ${r.status} ${r.statusText}`);
            return r.json();
          }),
          fetch('https://api.coingecko.com/api/v3/global', {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; CryptoCollectiveX/1.0)'
            }
          }).then(async r => {
            if (r.status === 429) {
              console.warn('CoinGecko Global rate limited (429), returning null');
              return { data: null };
            }
            if (!r.ok) throw new Error(`CoinGecko Global API error: ${r.status} ${r.statusText}`);
            return r.json();
          }),
          fetch('https://api.alternative.me/fng/', {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; CryptoCollectiveX/1.0)'
            }
          }).then(async r => {
            if (r.status === 429) {
              console.warn('Fear & Greed API rate limited (429), returning null');
              return { data: [null] };
            }
            if (!r.ok) throw new Error(`Fear & Greed API error: ${r.status} ${r.statusText}`);
            return r.json();
          })
        ]);
        console.log('Successfully fetched market data');
      } catch (fetchError) {
        console.error('External API fetch error:', fetchError.message);
        // Return partial data if available, or empty data
        return res.status(200).json({ 
          cryptoData: market || [],
          globalData: global?.data || null,
          fearGreed: fg?.data?.[0] || null,
          warning: 'Some data may be incomplete due to API rate limiting'
        });
      }

      res.json({
        cryptoData: market || [],
        globalData: global?.data || null,
        fearGreed: fg?.data?.[0] || null
      });
      return;
    } catch (error) {
      console.error('Unexpected Portfolio API error (GET):', error);
      console.error('Error stack:', error.stack);
      
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message || 'Unknown error occurred',
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
      });
      return;
    }
  }

  // Handle POST, PATCH, DELETE - User portfolio holdings
  // These require authentication
  try {
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

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;
    const db = getDatabase();
    const userHoldingsRef = db.ref(`users/${userId}/holdings`);

    // POST - Add new holding
    if (req.method === 'POST') {
      const { holding } = req.body;
      if (!holding || !holding.tokenId || !holding.amount || !holding.buyPrice) {
        return res.status(400).json({ error: 'Missing required fields: tokenId, amount, buyPrice' });
      }

      const newHoldingRef = userHoldingsRef.push();
      await newHoldingRef.set({
        tokenId: holding.tokenId.toLowerCase(),
        amount: parseFloat(holding.amount),
        buyPrice: parseFloat(holding.buyPrice),
        addedAt: admin.database.ServerValue.TIMESTAMP,
        addedBy: userEmail
      });

      console.log(`User ${userEmail} added holding: ${holding.tokenId}`);
      return res.status(200).json({ success: true, message: 'Holding added successfully' });
    }

    // PATCH - Update holding
    if (req.method === 'PATCH') {
      const { id, field, value } = req.body;
      if (!id || !field || value === undefined) {
        return res.status(400).json({ error: 'Missing required fields: id, field, value' });
      }

      const holdingRef = userHoldingsRef.child(id);
      const snapshot = await holdingRef.once('value');
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Holding not found' });
      }

      const updateData = {};
      if (field === 'amount') {
        updateData.amount = parseFloat(value);
      } else if (field === 'buyPrice') {
        updateData.buyPrice = parseFloat(value);
      } else {
        return res.status(400).json({ error: 'Invalid field. Allowed: amount, buyPrice' });
      }

      await holdingRef.update(updateData);
      console.log(`User ${userEmail} updated holding ${id}: ${field} = ${value}`);
      return res.status(200).json({ success: true, message: 'Holding updated successfully' });
    }

    // DELETE - Remove holding
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Missing required field: id' });
      }

      const holdingRef = userHoldingsRef.child(id);
      const snapshot = await holdingRef.once('value');
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Holding not found' });
      }

      await holdingRef.remove();
      console.log(`User ${userEmail} deleted holding ${id}`);
      return res.status(200).json({ success: true, message: 'Holding deleted successfully' });
    }

    // Method not supported
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Unexpected Portfolio API error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    });
  }
}