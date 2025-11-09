module.exports = async function handler(req, res) {
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
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const searchQuery = query.trim().toLowerCase();
    console.log(`Searching CoinGecko for: ${searchQuery}`);

    // Fetch coin list from CoinGecko
    const response = await fetch('https://api.coingecko.com/api/v3/coins/list?include_platform=false', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CryptoCollectiveX/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const allCoins = await response.json();
    
    // Filter coins by name or symbol
    const filtered = allCoins
      .filter(coin => 
        coin.name.toLowerCase().includes(searchQuery) || 
        coin.symbol.toLowerCase().includes(searchQuery) ||
        coin.id.toLowerCase().includes(searchQuery)
      )
      .slice(0, 50) // Limit to 50 results
      .map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase()
      }));

    console.log(`Found ${filtered.length} matching tokens`);
    
    res.status(200).json({ 
      success: true,
      tokens: filtered,
      count: filtered.length
    });

  } catch (error) {
    console.error('Token search error:', error);
    res.status(500).json({ 
      error: 'Failed to search tokens',
      message: error.message
    });
  }
};

