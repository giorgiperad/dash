// API endpoint to fetch crypto ETF data from sosovalue.com
// Usage: GET /api/etf-data

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.SOSOVALUE_API_KEY || 'SOSO-bc7956bf380549e2971d5c31a105287c';
    
    // Helper function to try fetching with different auth methods
    const tryFetch = async (url, apiKey) => {
      const authMethods = [
        // Method 1: X-API-Key header
        {
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        },
        // Method 2: Authorization Bearer
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        },
        // Method 3: Query parameter
        {
          url: `${url}?api_key=${encodeURIComponent(apiKey)}`,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        },
        // Method 4: API-Key header (alternative name)
        {
          headers: {
            'API-Key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      ];
      
      for (const method of authMethods) {
        try {
          const fetchUrl = method.url || url;
          const response = await fetch(fetchUrl, {
            headers: method.headers,
            signal: AbortSignal.timeout(8000)
          });
          
          if (response.ok) {
            const data = await response.json();
            // Validate that we got meaningful data
            if (data && typeof data === 'object' && Object.keys(data).length > 0) {
              console.log(`Successfully fetched from ${fetchUrl} using ${method.headers['X-API-Key'] ? 'X-API-Key' : method.headers['Authorization'] ? 'Bearer' : 'query param'}`);
              return data;
            }
          } else {
            const errorText = await response.text();
            console.warn(`API returned ${response.status} for ${fetchUrl}:`, errorText.substring(0, 200));
          }
        } catch (err) {
          console.warn(`Fetch failed for ${method.url || url}:`, err.message);
          continue;
        }
      }
      
      return null;
    };
    
    // Try multiple endpoint variations
    const endpoints = [
      'https://api.sosovalue.com/v1/etf/btc',
      'https://api.sosovalue.com/api/v1/etf/btc',
      'https://api.sosovalue.com/v1/bitcoin-etf',
      'https://api.sosovalue.com/api/v1/bitcoin-etf'
    ];
    
    let btcData = null;
    for (const endpoint of endpoints) {
      btcData = await tryFetch(endpoint, apiKey);
      if (btcData) break;
    }
    
    // Try ETH endpoints
    const ethEndpoints = [
      'https://api.sosovalue.com/v1/etf/eth',
      'https://api.sosovalue.com/api/v1/etf/eth',
      'https://api.sosovalue.com/v1/ethereum-etf',
      'https://api.sosovalue.com/api/v1/ethereum-etf'
    ];
    
    let ethData = null;
    for (const endpoint of ethEndpoints) {
      ethData = await tryFetch(endpoint, apiKey);
      if (ethData) break;
    }
    
    // If we have any data, return it
    if (btcData || ethData) {
      return res.status(200).json({
        success: true,
        data: {
          btc: btcData,
          eth: ethData
        },
        btc: btcData,
        eth: ethData,
        source: 'sosovalue'
      });
    }
    
    // If all attempts failed, return error with helpful message
    return res.status(200).json({
      success: false,
      data: null,
      message: 'ETF data temporarily unavailable. Please verify API key and endpoint configuration.',
      error: 'All API endpoint attempts failed',
      btc: null,
      eth: null
    });

  } catch (error) {
    console.error('ETF data fetch error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch ETF data',
      message: error.message
    });
  }
};
