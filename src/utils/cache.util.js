/**
 * Caché en memoria con TTL de 24 horas.
 * Se usa principalmente para catálogos que no cambian con frecuencia.
 */
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

function clearCache(key) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

module.exports = { getCache, setCache, clearCache };
