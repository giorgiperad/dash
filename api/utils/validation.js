/**
 * Input validation utilities
 * Provides sanitization and validation for API inputs
 */

/**
 * Validate and sanitize token ID
 * @param {string} tokenId - Token ID to validate
 * @returns {string|null} - Sanitized token ID or null if invalid
 */
function validateTokenId(tokenId) {
  if (!tokenId || typeof tokenId !== 'string') {
    return null;
  }
  
  // Sanitize: lowercase, trim, remove special characters (keep alphanumeric, hyphens, underscores)
  const sanitized = tokenId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
  
  // Validate length (CoinGecko IDs are typically 3-50 chars)
  if (sanitized.length < 1 || sanitized.length > 50) {
    return null;
  }
  
  return sanitized;
}

/**
 * Validate days parameter for history API
 * @param {any} days - Days value to validate
 * @returns {number|null} - Valid days number or null
 */
function validateDays(days) {
  const daysNum = parseInt(days, 10);
  
  if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
    return null;
  }
  
  return daysNum;
}

/**
 * Validate holding data
 * @param {Object} holding - Holding object to validate
 * @returns {{valid: boolean, errors: string[]}} - Validation result
 */
function validateHolding(holding) {
  const errors = [];
  
  if (!holding) {
    return { valid: false, errors: ['Holding object is required'] };
  }
  
  if (!holding.tokenId || typeof holding.tokenId !== 'string' || !holding.tokenId.trim()) {
    errors.push('tokenId is required and must be a non-empty string');
  }
  
  const amount = parseFloat(holding.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.push('amount must be a positive number');
  }
  
  const buyPrice = parseFloat(holding.buyPrice);
  if (isNaN(buyPrice) || buyPrice <= 0) {
    errors.push('buyPrice must be a positive number');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate alert data
 * @param {Object} alert - Alert object to validate
 * @returns {{valid: boolean, errors: string[]}} - Validation result
 */
function validateAlert(alert) {
  const errors = [];
  
  if (!alert) {
    return { valid: false, errors: ['Alert object is required'] };
  }
  
  if (!alert.tokenId || typeof alert.tokenId !== 'string' || !alert.tokenId.trim()) {
    errors.push('tokenId is required and must be a non-empty string');
  }
  
  if (!['above', 'below'].includes(alert.condition)) {
    errors.push('condition must be either "above" or "below"');
  }
  
  const target = parseFloat(alert.target);
  if (isNaN(target) || target <= 0) {
    errors.push('target must be a positive number');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Sanitize string input (prevent XSS)
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
function validateEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  validateTokenId,
  validateDays,
  validateHolding,
  validateAlert,
  sanitizeString,
  validateEmail
};

