// api/portfolio.js – WITH ERROR LOGGING
import admin from 'firebase-admin';

if (!admin.apps.length) {
  console.log('Initializing Firebase Admin...');
  console.log('PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
  console.log('CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
  console.log('PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);
  console.log('PRIVATE_KEY length:', process.env.FIREBASE_PRIVATE_KEY?.length);

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();

export default async function handler(req, res) {
  console.log('API called:', req.method, req.url);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tokenSnap = await db.ref('tokens').once('value');
    const tokens = Object.values(tokenSnap.val() || {}).map(t => t.id).filter(Boolean);

    if (!tokens.length) {
      console.log('No tokens in DB');
      return res.json({ cryptoData: [], globalData: null, fearGreed: null });
    }

    const ids = tokens.join(',');
    console.log('Fetching CoinGecko for:', ids);

    const [market, globalres, fg] = await Promise.all([
      fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`).then(r => r.json()),
      fetch('https://api.coingecko.com/api/v3/global').then(r => r.json()),
      fetch('https://api.alternative.me/fng/').then(r => r.json())
    ]);

    res.json({
      cryptoData: market,
      globalData: globalres.data,
      fearGreed: fg.data[0]
    });
  } catch (error) {
    console.error('API ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
}
