/**
 * Cache utility for storing API responses in localStorage
 * with timestamp-based expiration
 */

const CACHE_PREFIX = 'env_monitor_';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Get cached data if it exists and is not expired
 * @param {string} key - Cache key
 * @returns {object|null} Cached data or null if expired/not found
 */
export const getCachedData = (key) => {
  try {
    const cacheKey = CACHE_PREFIX + key;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired (older than 1 hour)
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

/**
 * Set data in cache with current timestamp
 * @param {string} key - Cache key
 * @param {object} data - Data to cache
 */
export const setCachedData = (key, data) => {
  try {
    const cacheKey = CACHE_PREFIX + key;
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 */
export const clearCache = (key) => {
  try {
    const cacheKey = CACHE_PREFIX + key;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Clear all cache entries with our prefix
 */
export const clearAllCache = () => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

/**
 * Calculate time until next 12 PM refresh
 * @returns {number} Milliseconds until next 12 PM
 */
export const getTimeUntilNextRefresh = () => {
  const now = new Date();
  const next12PM = new Date();

  // Set to today's 12 PM
  next12PM.setHours(12, 0, 0, 0);

  // If we're past 12 PM today, set to tomorrow's 12 PM
  if (now > next12PM) {
    next12PM.setDate(next12PM.getDate() + 1);
  }

  return next12PM - now;
};

/**
 * Check if we should fetch fresh data (after 12 PM)
 * @returns {boolean} True if we should fetch fresh data
 */
export const shouldFetchFreshData = () => {
  const lastFetchKey = CACHE_PREFIX + 'last_fetch_time';
  const lastFetch = localStorage.getItem(lastFetchKey);

  if (!lastFetch) {
    return true;
  }

  const lastFetchDate = new Date(parseInt(lastFetch));
  const now = new Date();

  // Get today's 12 PM
  const today12PM = new Date();
  today12PM.setHours(12, 0, 0, 0);

  // If current time is after 12 PM and last fetch was before today's 12 PM
  if (now > today12PM && lastFetchDate < today12PM) {
    return true;
  }

  return false;
};

/**
 * Mark that we just fetched fresh data
 */
export const markDataFetched = () => {
  const lastFetchKey = CACHE_PREFIX + 'last_fetch_time';
  localStorage.setItem(lastFetchKey, Date.now().toString());
};
