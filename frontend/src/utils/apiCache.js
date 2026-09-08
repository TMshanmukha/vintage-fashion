/**
 * High-Performance Client-Side Cache (Stale-While-Revalidate)
 * Stores API responses in memory and sessionStorage so page transitions
 * (Home -> Shop -> Collection -> Home) and repeat visits load INSTANTLY (0ms).
 */

const memoryCache = new Map();
const DEFAULT_TTL_MS = 3 * 60 * 1000; // 3 minutes

function getStorageKey(key) {
  return `vf_cache_${key}`;
}

function readFromStorage(key) {
  try {
    const raw = sessionStorage.getItem(getStorageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(getStorageKey(key));
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeToStorage(key, data, ttlMs) {
  try {
    const payload = {
      data,
      expiresAt: Date.now() + ttlMs,
    };
    sessionStorage.setItem(getStorageKey(key), JSON.stringify(payload));
  } catch {
    // sessionStorage full or quota exceeded - ignore
  }
}

/**
 * Fetch with Stale-While-Revalidate caching.
 * @param {string} key - Unique cache key (e.g. 'banners', 'categories')
 * @param {() => Promise<any>} fetcher - Async function that performs the API call
 * @param {object} options - { ttl: number, persist: boolean, forceFresh: boolean }
 * @returns {Promise<any>}
 */
export async function cachedFetch(key, fetcher, options = {}) {
  const { ttl = DEFAULT_TTL_MS, persist = true, forceFresh = false } = options;

  // 1. Check memory cache
  const memEntry = memoryCache.get(key);
  if (!forceFresh && memEntry && Date.now() < memEntry.expiresAt) {
    return memEntry.data;
  }

  // 2. Check sessionStorage
  if (!forceFresh && persist) {
    const stored = readFromStorage(key);
    if (stored !== null) {
      memoryCache.set(key, { data: stored, expiresAt: Date.now() + ttl });
      // Background revalidate (non-blocking)
      fetcher()
        .then((fresh) => {
          if (fresh !== undefined && fresh !== null) {
            memoryCache.set(key, { data: fresh, expiresAt: Date.now() + ttl });
            writeToStorage(key, fresh, ttl);
          }
        })
        .catch(() => {});
      return stored;
    }
  }

  // 3. Fresh fetch
  const freshData = await fetcher();
  memoryCache.set(key, { data: freshData, expiresAt: Date.now() + ttl });
  if (persist && freshData !== undefined) {
    writeToStorage(key, freshData, ttl);
  }

  return freshData;
}

/**
 * Helper to cache Axios GET requests transparently.
 * Returns an object with `{ data: responseBody, status: 200 }` matching Axios response shape.
 */
export async function cachedAxiosGet(axiosInstance, url, params = {}, options = {}) {
  const queryStr = params && Object.keys(params).length > 0
    ? "?" + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
      ).toString()
    : "";
  
  const cacheKey = `axios_${url}${queryStr}`;
  const { ttl = DEFAULT_TTL_MS, persist = true, forceFresh = false } = options;

  // 1. Memory cache check
  const memEntry = memoryCache.get(cacheKey);
  if (!forceFresh && memEntry && Date.now() < memEntry.expiresAt) {
    return { data: memEntry.data, status: 200, fromCache: true };
  }

  // 2. SessionStorage check
  if (!forceFresh && persist) {
    const stored = readFromStorage(cacheKey);
    if (stored !== null) {
      memoryCache.set(cacheKey, { data: stored, expiresAt: Date.now() + ttl });
      // Non-blocking background revalidation
      axiosInstance
        .get(url, { params })
        .then((res) => {
          if (res?.data) {
            memoryCache.set(cacheKey, { data: res.data, expiresAt: Date.now() + ttl });
            writeToStorage(cacheKey, res.data, ttl);
          }
        })
        .catch(() => {});
      return { data: stored, status: 200, fromCache: true };
    }
  }

  // 3. Fresh network fetch
  const res = await axiosInstance.get(url, { params });
  if (res?.data) {
    memoryCache.set(cacheKey, { data: res.data, expiresAt: Date.now() + ttl });
    if (persist) {
      writeToStorage(cacheKey, res.data, ttl);
    }
  }

  return res;
}

/**
 * Invalidate a specific cache key or all keys matching a prefix.
 * @param {string} prefix - e.g. 'products', 'categories', 'marketing', 'banners', 'brands', 'settings'
 */
export function invalidateCache(prefix) {
  if (!prefix) {
    memoryCache.clear();
    try {
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith("vf_cache_"))
        .forEach((k) => sessionStorage.removeItem(k));
    } catch {}
    return;
  }

  for (const k of memoryCache.keys()) {
    if (k.startsWith(prefix) || k.includes(prefix)) {
      memoryCache.delete(k);
    }
  }

  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("vf_cache_") && (k.includes(prefix) || prefix === "*"))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {}
}

export default {
  cachedFetch,
  cachedAxiosGet,
  invalidateCache,
};
