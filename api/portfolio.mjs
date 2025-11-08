// api/portfolio.js – COMMONJS
const admin = require('firebase-admin');

if (!admin.apps.length) {
  console.log('Initializing Firebase Admin...');
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

module.exports = async (req, res) => {
  console.log('API called:', req.method);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const tokenSnap = await db.ref('tokens').once('value');
    const tokens = Object.values(tokenSnap.val() || {}).map(t => t.id).filter(Boolean);
    
    if (!tokens.length) {
      return res.json({ cryptoData: [], globalData: null, fearGreed: null });
    }
    
    const ids = tokens.join(',');
    
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
};
