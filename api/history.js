const admin = require('firebase-admin');

// Cache for historical data
const historyCache = {
  data: {},
  timestamps: {},
  TTL: 300000 // 5 minutes cache for historical data
};

function isHistoryCacheValid(tokenId, days) {
  const key = `${tokenId}_${days}`;
  if (!historyCache.timestamps[key]) return false;
  const age = Date.now() - historyCache.timestamps[key];
  return age < historyCache.TTL;
}

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
      console.error('Firebase initialization error:', error.message);
      throw error;
    }
  }
  return admin.database();
}

// Fetch with retry and fallback APIs
async function fetchWithRetry(url, options = {}, maxRetries = 2, delay = 1000) {
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; CryptoCollectiveX/1.0)',
    ...options.headers
  };
  
  if (apiKey && url.includes('api.coingecko.com')) {
    url += (url.includes('?') ? '&' : '?') + `x_cg_demo_api_key=${apiKey}`;
  }
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 429) {
        if (i < maxRetries) {
          const waitTime = delay * Math.pow(2, i);
          console.warn(`Rate limited (429), retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        return null;
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
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  return null;
}

// Try CoinMarketCap as fallback (requires API key)
async function fetchFromCoinMarketCap(tokenId, days) {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey) return null;
  
  try {
    // CoinMarketCap uses symbol mapping, so we'd need to map tokenId to symbol
    // For now, return null - this is a placeholder for future implementation
    return null;
  } catch (error) {
    console.warn('CoinMarketCap fetch failed:', error.message);
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Apply rate limiting first
  const { rateLimiters } = require('./rate-limit');
  const rateLimiter = rateLimiters.standard;
  
  return new Promise((resolve) => {
    rateLimiter(req, res, async () => {
      try {
        const { validateTokenId, validateDays } = require('./utils/validation');
        const { id, days = '7' } = req.query;
        
        if (!id) {
          res.status(400).json({ error: 'Missing token ID parameter' });
          return resolve();
        }

        const tokenId = validateTokenId(id);
        if (!tokenId) {
          res.status(400).json({ error: 'Invalid token ID format' });
          return resolve();
        }
        
        const daysNum = validateDays(days);
        if (!daysNum) {
          res.status(400).json({ error: 'Days must be between 1 and 365' });
          return resolve();
        }

        // Check cache
        const cacheKey = `${tokenId}_${daysNum}`;
        if (isHistoryCacheValid(tokenId, daysNum)) {
          console.log(`Returning cached history for ${tokenId}`);
          res.json({
            prices: historyCache.data[cacheKey],
            cached: true
          });
          return resolve();
        }

        // Fetch fresh data
        await fetchHistoryData(req, res, tokenId, daysNum, cacheKey);
        resolve();
      } catch (error) {
        console.error('History API error:', error);
        res.status(500).json({ 
          error: 'Internal server error',
          message: error.message || 'Unknown error occurred'
        });
        resolve();
      }
    });
  });
};

async function fetchHistoryData(req, res, tokenId, daysNum, cacheKey) {

  // Fetch from CoinGecko
  const coingeckoUrl = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=${daysNum}`;
  let data = await fetchWithRetry(coingeckoUrl, {}, 2, 500);

  // If CoinGecko fails, try fallback (future: CoinMarketCap)
  if (!data) {
    data = await fetchFromCoinMarketCap(tokenId, daysNum);
  }

  if (!data || !data.prices) {
    return res.status(404).json({ 
      error: 'Historical data not found',
      message: `Could not fetch price history for ${tokenId}`
    });
  }

  // Format data for chart.js
  const prices = data.prices.map(([timestamp, price]) => ({
    x: timestamp,
    y: price
  }));

  // Update cache
  historyCache.data[cacheKey] = prices;
  historyCache.timestamps[cacheKey] = Date.now();

  res.json({
    prices: prices,
    cached: false
  });
}

