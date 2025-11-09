// API endpoint to fetch crypto ETF data from sosovalue.com
// Usage: GET /api/etf-data
// Documentation: https://sosovalue.gitbook.io/soso-value-api-doc/api-document/get-current-etf-data-metrics

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
    const apiUrl = 'https://api.sosovalue.xyz/openapi/v2/etf/currentEtfDataMetrics';
    
    // Fetch Bitcoin ETF data
    const btcResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-soso-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'us-btc-spot' }),
      signal: AbortSignal.timeout(10000)
    });
    
    // Fetch Ethereum ETF data
    const ethResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-soso-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'us-eth-spot' }),
      signal: AbortSignal.timeout(10000)
    });
    
    let btcData = null;
    let ethData = null;
    
    // Process Bitcoin ETF response
    if (btcResponse.ok) {
      try {
        const btcResult = await btcResponse.json();
        if (btcResult.code === 0 && btcResult.data) {
          btcData = btcResult.data;
          console.log('BTC ETF data fetched successfully');
        } else {
          console.warn('BTC ETF API returned error:', btcResult.msg || 'Unknown error');
        }
      } catch (e) {
        console.warn('Failed to parse BTC ETF data:', e.message);
      }
    } else {
      const errorText = await btcResponse.text();
      console.warn(`BTC ETF API returned ${btcResponse.status}:`, errorText.substring(0, 200));
    }
    
    // Process Ethereum ETF response
    if (ethResponse.ok) {
      try {
        const ethResult = await ethResponse.json();
        if (ethResult.code === 0 && ethResult.data) {
          ethData = ethResult.data;
          console.log('ETH ETF data fetched successfully');
        } else {
          console.warn('ETH ETF API returned error:', ethResult.msg || 'Unknown error');
        }
      } catch (e) {
        console.warn('Failed to parse ETH ETF data:', e.message);
      }
    } else {
      const errorText = await ethResponse.text();
      console.warn(`ETH ETF API returned ${ethResponse.status}:`, errorText.substring(0, 200));
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
    
    // If all attempts failed, return error
    return res.status(200).json({
      success: false,
      data: null,
      message: 'ETF data temporarily unavailable. Please verify API key and endpoint configuration.',
      error: 'Failed to fetch ETF data from SoSoValue API',
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
