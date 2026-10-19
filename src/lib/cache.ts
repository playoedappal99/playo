// Shared in-memory cache for ultra-fast API response times

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const productsCacheMap = new Map<string, CacheEntry<any>>();
let categoriesCache: CacheEntry<any> | null = null;
let offersCache: CacheEntry<any> | null = null;

export function getCachedProducts(key: string): any | null {
  const entry = productsCacheMap.get(key);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data;
  }
  return null;
}

export function setCachedProducts(key: string, data: any, ttlMs = 5000) {
  productsCacheMap.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function clearProductsCache() {
  productsCacheMap.clear();
}

export function getCachedCategories(): any | null {
  if (categoriesCache && Date.now() < categoriesCache.expiresAt) {
    return categoriesCache.data;
  }
  return null;
}

export function setCachedCategories(data: any, ttlMs = 5000) {
  categoriesCache = { data, expiresAt: Date.now() + ttlMs };
}

export function clearCategoriesCache() {
  categoriesCache = null;
}

export function getCachedOffers(): any | null {
  if (offersCache && Date.now() < offersCache.expiresAt) {
    return offersCache.data;
  }
  return null;
}

export function setCachedOffers(data: any, ttlMs = 5000) {
  offersCache = { data, expiresAt: Date.now() + ttlMs };
}

export function clearOffersCache() {
  offersCache = null;
}
