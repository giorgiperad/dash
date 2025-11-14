// Simple in-memory rate limiter for API endpoints
// In production, consider using Redis or a dedicated service

const rateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 0) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 * @param {string} options.keyGenerator - Function to generate rate limit key from request
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 60000, // 1 minute default
    maxRequests = 60, // 60 requests per minute default
    keyGenerator = (req) => {
      // Default: use IP address or user ID
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // For authenticated users, we'd need to decode the token
        // For now, use IP as fallback
        return req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
      }
      return req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    }
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    let rateLimitData = rateLimitStore.get(key);
    
    if (!rateLimitData || now > rateLimitData.resetTime) {
      // Create new window
      rateLimitData = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, rateLimitData);
      return next();
    }
    
    if (rateLimitData.count >= maxRequests) {
      const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(rateLimitData.resetTime).toISOString());
      res.setHeader('Retry-After', retryAfter);
      
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter: retryAfter
      });
    }
    
    rateLimitData.count++;
    rateLimitStore.set(key, rateLimitData);
    
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - rateLimitData.count));
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitData.resetTime).toISOString());
    
    next();
  };
}

// Pre-configured rate limiters
const rateLimiters = {
  // Strict rate limiter for expensive operations
  strict: createRateLimiter({
    windowMs: 60000, // 1 minute
    maxRequests: 10
  }),
  
  // Standard rate limiter for regular API calls
  standard: createRateLimiter({
    windowMs: 60000, // 1 minute
    maxRequests: 60
  }),
  
  // Lenient rate limiter for public endpoints
  lenient: createRateLimiter({
    windowMs: 60000, // 1 minute
    maxRequests: 120
  })
};

module.exports = {
  createRateLimiter,
  rateLimiters
};

