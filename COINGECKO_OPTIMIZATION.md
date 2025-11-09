# CoinGecko Rate Limit Optimization Guide

## Current Implementation

✅ **Server-Side Caching**: 60-second cache to reduce API calls
✅ **Increased Refresh Interval**: 3 minutes (180 seconds) instead of 90 seconds
✅ **Retry Logic**: Automatic retry with exponential backoff
✅ **Stale Cache Fallback**: Uses cached data if API fails

## CoinGecko Rate Limits

- **Free Tier**: 5-15 calls/minute (very limited)
- **Demo Account** (FREE): 30 calls/minute - **RECOMMENDED**
- **Analyst Plan**: 500 calls/minute ($129/month)
- **Lite Plan**: 1,000 calls/minute ($249/month)

## How to Increase Rate Limits

### Option 1: Get Free Demo Account (RECOMMENDED - FREE)

1. Go to https://www.coingecko.com/en/api
2. Click "Get Your API Key Now"
3. Sign up for a free account
4. Get your API key from the dashboard
5. Add it to Vercel environment variables:
   - Variable name: `COINGECKO_API_KEY`
   - Variable value: Your API key
   - Environment: Production, Preview, Development

**This gives you 30 calls/minute for FREE!**

### Option 2: Upgrade to Paid Plan

If you need more than 30 calls/minute:
- Visit https://www.coingecko.com/en/api/pricing
- Choose a plan that fits your needs
- Add the API key to Vercel as above

## Current API Call Frequency

With current settings:
- **Refresh interval**: 3 minutes (180 seconds)
- **Calls per hour**: ~20 calls/hour
- **Calls per minute**: ~0.33 calls/minute

This is well within:
- ✅ Free tier limits (5-15 calls/minute)
- ✅ Demo account limits (30 calls/minute)
- ✅ Even without API key, should work fine

## Cache Strategy

- **Cache TTL**: 60 seconds
- **Multiple users**: Share the same cache (reduces API calls)
- **Stale cache**: Used if API fails (graceful degradation)

## Manual Refresh

Users can click the refresh button to get fresh data immediately (bypasses cache).

## Monitoring

Check Vercel logs for:
- `Returning cached market data` - Cache hit (no API call)
- `Fetching fresh data` - Cache miss (API call made)
- `Rate limited (429)` - Rate limit hit (will retry)

