// Simple test endpoint to check if environment variables are set
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  const envCheck = {
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY ? 'Set (hidden)' : false,
    FIREBASE_DATABASE_URL: !!process.env.FIREBASE_DATABASE_URL,
    // Show first few chars of project ID and email for verification
    projectId: process.env.FIREBASE_PROJECT_ID || 'NOT SET',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? process.env.FIREBASE_CLIENT_EMAIL.substring(0, 30) + '...' : 'NOT SET',
    databaseURL: process.env.FIREBASE_DATABASE_URL ? process.env.FIREBASE_DATABASE_URL.substring(0, 50) + '...' : 'NOT SET',
    privateKeyLength: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0,
    privateKeyStartsWith: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.substring(0, 30) : 'NOT SET'
  };
  
  res.json({
    status: 'Environment Variables Check',
    allSet: envCheck.FIREBASE_PROJECT_ID && envCheck.FIREBASE_CLIENT_EMAIL && envCheck.FIREBASE_PRIVATE_KEY && envCheck.FIREBASE_DATABASE_URL,
    details: envCheck,
    message: envCheck.FIREBASE_PROJECT_ID && envCheck.FIREBASE_CLIENT_EMAIL && envCheck.FIREBASE_PRIVATE_KEY && envCheck.FIREBASE_DATABASE_URL
      ? 'All environment variables are set!'
      : 'Some environment variables are missing. Check Vercel Dashboard → Settings → Environment Variables'
  });
};

