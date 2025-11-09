const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.database();

// Secure API: Get market data
exports.getMarketData = functions.https.onCall(async (data, context) => {
  const tokenSnap = await db.ref('tokens').once('value');
  const tokens = Object.values(tokenSnap.val() || {}).map(t => t.id).filter(Boolean);
  if (!tokens.length) return { cryptoData: [], globalData: null, fearGreed: null };

  const ids = tokens.join(',');
  const [market, global, fg] = await Promise.all([
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`)
      .then(r => {
        if (!r.ok) throw new Error(`CoinGecko API error: ${r.status}`);
        return r.json();
      })
      .catch(error => {
        console.error('Market data fetch error:', error);
        return [];
      }),
    fetch('https://api.coingecko.com/api/v3/global')
      .then(r => {
        if (!r.ok) throw new Error(`CoinGecko Global API error: ${r.status}`);
        return r.json();
      })
      .catch(error => {
        console.error('Global data fetch error:', error);
        return { data: null };
      }),
    fetch('https://api.alternative.me/fng/')
      .then(r => {
        if (!r.ok) throw new Error(`Fear & Greed API error: ${r.status}`);
        return r.json();
      })
      .catch(error => {
        console.error('Fear & Greed fetch error:', error);
        return { data: [] };
      })
  ]);

  return {
    cryptoData: market || [],
    globalData: global?.data || null,
    fearGreed: fg?.data?.[0] || null
  };
});

// Secure API: Portfolio (only logged-in user)
exports.getPortfolio = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const snap = await db.ref(`portfolios/${context.auth.uid}`).once('value');
  return snap.val() || {};
});

exports.updateHolding = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { id, field, value } = data;
  await db.ref(`portfolios/${context.auth.uid}/${id}`).update({ [field]: value });
  return { success: true };
});

exports.deleteHolding = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  await db.ref(`portfolios/${context.auth.uid}/${data.id}`).remove();
  return { success: true };
});

exports.addHolding = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const key = db.ref(`portfolios/${context.auth.uid}`).push().key;
  await db.ref(`portfolios/${context.auth.uid}/${key}`).set(data.holding);
  return { success: true };
});

// Admin: Add token
exports.addToken = functions.https.onCall(async (data, context) => {
  if (context.auth?.token?.email !== 'admin@ccx.com') throw new functions.https.HttpsError('permission-denied', 'Admin only');
  const key = db.ref('tokens').push().key;
  await db.ref(`tokens/${key}`).set({ id: data.id });
  return { success: true };
});
