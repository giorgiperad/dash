const admin = require('firebase-admin');

// In-memory cache for CoinGecko data
const cache = {
  market: null,
  global: null,
  fearGreed: null,
  etfFlows: null,
  timestamp: null,
  TTL: 60000 // Cache for 60 seconds (1 minute)
};

// Helper function to check if cache is valid
function isCacheValid() {
  if (!cache.timestamp) return false;
  const age = Date.now() - cache.timestamp;
  return age < cache.TTL;
}

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
        return res.json({ cryptoData: [], globalData: null, fearGreed: null, etfFlows: null });
      }

      // Check cache first
      if (isCacheValid()) {
        console.log('Returning cached market data');
        return res.json({
          cryptoData: cache.market || [],
          globalData: cache.global?.data || null,
          fearGreed: cache.fearGreed?.data?.[0] || null,
          etfFlows: cache.etfFlows || null,
          cached: true
        });
      }

      // Fetch market data from CoinGecko with retry logic
      const ids = tokens.join(',');
      console.log(`Fetching fresh data for tokens: ${ids}`);
      
      // Helper function to fetch with retry
      const fetchWithRetry = async (url, options = {}, maxRetries = 2, delay = 1000) => {
        // Add CoinGecko API key if available
        const apiKey = process.env.COINGECKO_API_KEY;
        const headers = {
          'User-Agent': 'Mozilla/5.0 (compatible; CryptoCollectiveX/1.0)',
          ...options.headers
        };
        
        // Add API key to URL if provided (CoinGecko uses query parameter)
        if (apiKey && url.includes('api.coingecko.com')) {
          url += (url.includes('?') ? '&' : '?') + `x_cg_demo_api_key=${apiKey}`;
        }
        
        for (let i = 0; i <= maxRetries; i++) {
          try {
            const response = await fetch(url, {
              ...options,
              headers: headers
            });
            
            if (response.status === 429) {
              // Rate limited - wait and retry
              if (i < maxRetries) {
                const waitTime = delay * Math.pow(2, i); // Exponential backoff
                console.warn(`Rate limited (429), retrying in ${waitTime}ms... (attempt ${i + 1}/${maxRetries + 1})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
              } else {
                console.warn('Rate limited (429) after all retries, returning empty data');
                return null; // Return null to indicate failure
              }
            }
            
            if (!response.ok) {
              throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
          } catch (error) {
            if (i === maxRetries) {
              console.error(`Fetch failed after ${maxRetries + 1} attempts:`, error.message);
              return null;
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
          }
        }
        return null;
      };
      
      let market, global, fg;
      try {
        // Fetch with retry logic and staggered delays to avoid rate limits
        market = await fetchWithRetry(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`,
          {},
          2,
          500
        );
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
        
        global = await fetchWithRetry(
          'https://api.coingecko.com/api/v3/global',
          {},
          2,
          500
        );
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
        
        fg = await fetchWithRetry(
          'https://api.alternative.me/fng/',
          {},
          2,
          500
        );
        
        // Small delay before ETF data fetch
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Fetch ETF flow data from Farside API
        let etfFlows = null;
        try {
          const etfResponse = await fetch('https://farside.co.uk/bitcoin-etf/flow', {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CryptoCollectiveX/1.0)' },
            timeout: 5000
          });
          if (etfResponse.ok) {
            const etfData = await etfResponse.json();
            // Handle different response formats
            if (etfData && Array.isArray(etfData) && etfData.length > 0) {
              // Calculate today's flow (most recent entry)
              const today = etfData[0] || {};
              const todayFlow = parseFloat(today.net || today.flow || 0) || 0;
              
              // Calculate 7-day total (last 7 entries)
              const weekFlow = etfData.slice(0, 7).reduce((sum, day) => {
                const flow = parseFloat(day.net || day.flow || 0) || 0;
                return sum + flow;
              }, 0);
              
              // Calculate total (all entries)
              const totalFlow = etfData.reduce((sum, day) => {
                const flow = parseFloat(day.net || day.flow || 0) || 0;
                return sum + flow;
              }, 0);
              
              etfFlows = {
                today: todayFlow,
                week: weekFlow,
                total: totalFlow
              };
              console.log('ETF flows fetched successfully:', etfFlows);
            }
          } else {
            console.warn('ETF API returned non-OK status:', etfResponse.status);
          }
        } catch (etfError) {
          console.warn('ETF flow data fetch failed:', etfError.message);
          // Continue without ETF data - not critical
        }
        
        // If all requests failed due to rate limiting, return error
        if (!market && !global && !fg) {
          return res.status(503).json({
            error: 'Service temporarily unavailable',
            message: 'CoinGecko API rate limit exceeded. Please try again in a few moments.',
            retryAfter: 60 // Suggest retrying after 60 seconds
          });
        }
        
        console.log('Successfully fetched market data');
        
        // Update cache with fresh data
        cache.market = market || [];
        cache.global = global || null;
        cache.fearGreed = fg || null;
        cache.etfFlows = etfFlows || null;
        cache.timestamp = Date.now();
        
      } catch (fetchError) {
        console.error('External API fetch error:', fetchError.message);
        // Return cached data if available, otherwise return partial data
        if (cache.market && cache.timestamp) {
          const cacheAge = Date.now() - cache.timestamp;
          console.log(`Returning stale cache (${Math.round(cacheAge / 1000)}s old) due to API error`);
          return res.status(200).json({ 
            cryptoData: cache.market || [],
            globalData: cache.global?.data || null,
            fearGreed: cache.fearGreed?.data?.[0] || null,
            etfFlows: cache.etfFlows || null,
            cached: true,
            stale: true,
            warning: 'Using cached data due to API error'
          });
        }
        // Return partial data if available
        return res.status(200).json({ 
          cryptoData: market || [],
          globalData: global?.data || null,
          fearGreed: fg?.data?.[0] || null,
          etfFlows: null,
          warning: 'Some data may be incomplete due to API rate limiting'
        });
      }

      res.json({
        cryptoData: market || [],
        globalData: global?.data || null,
        fearGreed: fg?.data?.[0] || null,
        etfFlows: etfFlows || null,
        cached: false
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