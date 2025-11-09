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
    
    // Fetch all ETF data in parallel with error handling
    const fetchPromises = [
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'x-soso-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'us-btc-spot' }),
        signal: AbortSignal.timeout(10000)
      }).catch(err => {
        console.warn('BTC ETF fetch error:', err.message);
        return null;
      }),
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'x-soso-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'us-eth-spot' }),
        signal: AbortSignal.timeout(10000)
      }).catch(err => {
        console.warn('ETH ETF fetch error:', err.message);
        return null;
      }),
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'x-soso-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'us-sol-spot' }),
        signal: AbortSignal.timeout(10000)
      }).catch(() => null), // Solana ETF might not exist yet
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'x-soso-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'us-hbar-spot' }),
        signal: AbortSignal.timeout(10000)
      }).catch(() => null), // HBAR ETF might not exist yet
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'x-soso-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'us-ltc-spot' }),
        signal: AbortSignal.timeout(10000)
      }).catch(() => null) // LTC ETF might not exist yet
    ];
    
    const [btcResponse, ethResponse, solResponse, hbarResponse, ltcResponse] = await Promise.all(fetchPromises);
    
    let btcData = null;
    let ethData = null;
    let solData = null;
    let hbarData = null;
    let ltcData = null;
    
    // Process Bitcoin ETF response
    if (btcResponse && btcResponse.ok) {
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
    } else if (btcResponse) {
      try {
        const errorText = await btcResponse.text();
        console.warn(`BTC ETF API returned ${btcResponse.status}:`, errorText.substring(0, 200));
      } catch (e) {
        console.warn('BTC ETF response error:', e.message);
      }
    } else {
      console.warn('BTC ETF fetch failed - no response');
    }
    
    // Process Ethereum ETF response
    if (ethResponse && ethResponse.ok) {
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
    } else if (ethResponse) {
      const errorText = await ethResponse.text();
      console.warn(`ETH ETF API returned ${ethResponse.status}:`, errorText.substring(0, 200));
    }
    
    // Process Solana ETF response
    if (solResponse && solResponse.ok) {
      try {
        const solResult = await solResponse.json();
        if (solResult.code === 0 && solResult.data) {
          solData = solResult.data;
          console.log('SOL ETF data fetched successfully');
        } else {
          console.warn('SOL ETF API returned error:', solResult.msg || 'Unknown error');
        }
      } catch (e) {
        console.warn('Failed to parse SOL ETF data:', e.message);
      }
    } else if (solResponse) {
      try {
        const errorText = await solResponse.text();
        console.warn(`SOL ETF API returned ${solResponse.status}:`, errorText.substring(0, 200));
      } catch (e) {
        console.warn('SOL ETF not available');
      }
    }
    
    // Process HBAR ETF response
    if (hbarResponse && hbarResponse.ok) {
      try {
        const hbarResult = await hbarResponse.json();
        if (hbarResult.code === 0 && hbarResult.data) {
          hbarData = hbarResult.data;
          console.log('HBAR ETF data fetched successfully');
        } else {
          console.warn('HBAR ETF API returned error:', hbarResult.msg || 'Unknown error');
        }
      } catch (e) {
        console.warn('Failed to parse HBAR ETF data:', e.message);
      }
    } else if (hbarResponse) {
      try {
        const errorText = await hbarResponse.text();
        console.warn(`HBAR ETF API returned ${hbarResponse.status}:`, errorText.substring(0, 200));
      } catch (e) {
        console.warn('HBAR ETF not available');
      }
    }
    
    // Process LTC ETF response
    if (ltcResponse && ltcResponse.ok) {
      try {
        const ltcResult = await ltcResponse.json();
        if (ltcResult.code === 0 && ltcResult.data) {
          ltcData = ltcResult.data;
          console.log('LTC ETF data fetched successfully');
        } else {
          console.warn('LTC ETF API returned error:', ltcResult.msg || 'Unknown error');
        }
      } catch (e) {
        console.warn('Failed to parse LTC ETF data:', e.message);
      }
    } else if (ltcResponse) {
      try {
        const errorText = await ltcResponse.text();
        console.warn(`LTC ETF API returned ${ltcResponse.status}:`, errorText.substring(0, 200));
      } catch (e) {
        console.warn('LTC ETF not available');
      }
    }
    
    // If we have any data, return it
    if (btcData || ethData || solData || hbarData || ltcData) {
      return res.status(200).json({
        success: true,
        etfData: {
          btc: btcData,
          eth: ethData,
          sol: solData,
          hbar: hbarData,
          ltc: ltcData
        },
        data: {
          btc: btcData,
          eth: ethData,
          sol: solData,
          hbar: hbarData,
          ltc: ltcData
        },
        btc: btcData,
        eth: ethData,
        sol: solData,
        hbar: hbarData,
        ltc: ltcData,
        source: 'sosovalue'
      });
    }
    
    // If all attempts failed, return error with more details
    console.error('ETF data fetch failed - No data received from API');
    return res.status(200).json({
      success: false,
      etfData: null,
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
      message: error.message || 'Network or server error occurred',
      error: error.name || 'Unknown error'
    });
  }
};
