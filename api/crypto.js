// api/crypto.js – Vercel Serverless Function
export default async function handler(req, res) {
  // CORS ჰედერები ყველა მოთხოვნისთვის
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
  
  const { url } = req.query;
  
  if (!url) {
    res.status(400).json({ error: 'Missing URL parameter' });
    return;
  }

  // Validate URL to prevent SSRF attacks
  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(url);
    const urlObj = new URL(decodedUrl);
    // Only allow CoinGecko and alternative.me domains
    const allowedDomains = ['api.coingecko.com', 'alternative.me'];
    if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      res.status(400).json({ error: 'Invalid URL domain. Only CoinGecko and alternative.me are allowed.' });
      return;
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }
  
  try {
    // Fetch CoinGecko-დან (Vercel-ის სერვერზე CORS არ იბლოკება)
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CryptoCollectiveX/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`); // ✅ FIXED
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch data: ' + error.message });
  }
}
