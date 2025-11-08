// api/portfolio.js – Full secure backend
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();

// GET /api/portfolio – Market data (public)
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const tokenSnap = await db.ref('tokens').once('value');
    const tokens = Object.values(tokenSnap.val() || {}).map(t => t.id).filter(Boolean);
    if (!tokens.length) return res.json({ cryptoData: [], globalData: null, fearGreed: null });

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
    res.status(500).json({ error: error.message });
  }
}

// POST /api/portfolio – Add holding
if (req.method === 'POST') {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { holding } = req.body;
    const key = db.ref(`portfolios/${decoded.uid}`).push().key;
    await db.ref(`portfolios/${decoded.uid}/${key}`).set(holding);
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// PATCH /api/portfolio – Update holding
if (req.method === 'PATCH') {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { id, field, value } = req.body;
    await db.ref(`portfolios/${decoded.uid}/${id}`).update({ [field]: value });
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// DELETE /api/portfolio – Delete holding
if (req.method === 'DELETE') {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { id } = req.body;
    await db.ref(`portfolios/${decoded.uid}/${id}`).remove();
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// POST /api/alerts – Add alert
if (req.method === 'POST' && req.url === '/api/alerts') {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { alert } = req.body;
    const key = db.ref(`alerts/${decoded.uid}`).push().key;
    await db.ref(`alerts/${decoded.uid}/${key}`).set({ ...alert, notified: false });
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/alerts – Get alerts
if (req.method === 'GET' && req.url === '/api/alerts') {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const snap = await db.ref(`alerts/${decoded.uid}`).once('value');
    res.json(snap.val() || {});
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// DELETE /api/alerts/[id] – Delete alert
if (req.method === 'DELETE' && req.url.startsWith('/api/alerts/')) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const id = req.url.split('/api/alerts/')[1];
    await db.ref(`alerts/${decoded.uid}/${id}`).remove();
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// POST /api/token – Add token (admin only)
if (req.method === 'POST' && req.url === '/api/token') {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    if (decoded.email !== 'testireba5@gmail.com') throw new Error('Admin only');
    const { id } = req.body;
    const key = db.ref('tokens').push().key;
    await db.ref(`tokens/${key}`).set({ id });
    res.json({ success: true });
  } catch (e) {
    res.status(403).json({ error: e.message });
  }
}
