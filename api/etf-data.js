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
    
    // Fetch Bitcoin ETF data
    const btcEtfUrl = 'https://api.sosovalue.com/v1/etf/btc';
    const ethEtfUrl = 'https://api.sosovalue.com/v1/etf/eth';
    
    const [btcResponse, ethResponse] = await Promise.allSettled([
      fetch(btcEtfUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'CryptoCollectiveX/1.0'
        },
        signal: AbortSignal.timeout(10000)
      }),
      fetch(ethEtfUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'CryptoCollectiveX/1.0'
        },
        signal: AbortSignal.timeout(10000)
      })
    ]);

    const etfData = {
      btc: null,
      eth: null
    };

    // Process Bitcoin ETF data
    if (btcResponse.status === 'fulfilled' && btcResponse.value.ok) {
      try {
        const btcData = await btcResponse.value.json();
        etfData.btc = btcData;
      } catch (e) {
        console.warn('Failed to parse BTC ETF data:', e.message);
      }
    } else {
      console.warn('BTC ETF fetch failed:', btcResponse.status === 'rejected' ? btcResponse.reason : btcResponse.value.status);
    }

    // Process Ethereum ETF data
    if (ethResponse.status === 'fulfilled' && ethResponse.value.ok) {
      try {
        const ethData = await ethResponse.value.json();
        etfData.eth = ethData;
      } catch (e) {
        console.warn('Failed to parse ETH ETF data:', e.message);
      }
    } else {
      console.warn('ETH ETF fetch failed:', ethResponse.status === 'rejected' ? ethResponse.reason : ethResponse.value.status);
    }

    // If both failed, try alternative endpoints or format
    if (!etfData.btc && !etfData.eth) {
      // Try alternative API format
      try {
        const altUrl = 'https://api.sosovalue.com/v1/crypto-etf';
        const altResponse = await fetch(altUrl, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'CryptoCollectiveX/1.0'
          },
          signal: AbortSignal.timeout(10000)
        });

        if (altResponse.ok) {
          const altData = await altResponse.json();
          return res.status(200).json({
            success: true,
            data: altData,
            source: 'sosovalue'
          });
        }
      } catch (altError) {
        console.warn('Alternative ETF endpoint failed:', altError.message);
      }

      return res.status(200).json({
        success: false,
        data: null,
        message: 'ETF data temporarily unavailable',
        btc: null,
        eth: null
      });
    }

    return res.status(200).json({
      success: true,
      data: etfData,
      btc: etfData.btc,
      eth: etfData.eth,
      source: 'sosovalue'
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

