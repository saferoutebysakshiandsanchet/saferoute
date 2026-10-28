/**
 * SafeRoute Offline Map Tile Management & Caching Engine
 * Enables seamless pedestrian safety navigation through cellular dead zones
 * using browser CacheStorage API and OpenStreetMap raster tiles.
 */

export const OFFLINE_CACHE_NAME = 'saferoute-offline-tiles-v1';

// Convert Lat/Lng to OpenStreetMap Slippy Map Tile (X, Y)
export function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

export interface CacheProgress {
  total: number;
  completed: number;
  failed: number;
  percent: number;
}

/**
 * Downloads and caches OpenStreetMap tiles around a given center point and zoom range.
 */
export async function downloadAreaTiles(
  centerLat: number,
  centerLng: number,
  radiusTiles = 2,
  zoomLevels = [14, 15, 16],
  onProgress?: (progress: CacheProgress) => void
): Promise<{ success: boolean; cachedCount: number }> {
  if (!('caches' in window)) {
    console.warn('CacheStorage is not supported in this browser.');
    return { success: false, cachedCount: 0 };
  }

  const cache = await caches.open(OFFLINE_CACHE_NAME);
  const tileUrls: string[] = [];

  for (const z of zoomLevels) {
    const { x: centerX, y: centerY } = latLngToTile(centerLat, centerLng, z);
    for (let dx = -radiusTiles; dx <= radiusTiles; dx++) {
      for (let dy = -radiusTiles; dy <= radiusTiles; dy++) {
        const x = centerX + dx;
        const y = centerY + dy;
        const sub = ['a', 'b', 'c'][(x + y) % 3];
        const url = `https://${sub}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
        tileUrls.push(url);
      }
    }
  }

  const uniqueUrls = Array.from(new Set(tileUrls));
  const total = uniqueUrls.length;
  let completed = 0;
  let failed = 0;

  for (const url of uniqueUrls) {
    try {
      // Check if already in cache
      const existing = await cache.match(url);
      if (!existing) {
        const response = await fetch(url, { mode: 'cors' });
        if (response.ok) {
          await cache.put(url, response);
        } else {
          failed++;
        }
      }
    } catch (e) {
      failed++;
    }
    completed++;
    if (onProgress) {
      onProgress({
        total,
        completed,
        failed,
        percent: Math.round((completed / total) * 100),
      });
    }
  }

  return { success: true, cachedCount: completed - failed };
}

/**
 * Returns the number of cached map tiles currently stored.
 */
export async function getCachedTileCount(): Promise<number> {
  if (!('caches' in window)) return 0;
  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    const keys = await cache.keys();
    return keys.length;
  } catch (err) {
    console.warn('Failed to inspect cached tiles:', err);
    return 0;
  }
}

/**
 * Clears all stored offline map tiles from storage.
 */
export async function clearOfflineTiles(): Promise<boolean> {
  if (!('caches' in window)) return false;
  try {
    return await caches.delete(OFFLINE_CACHE_NAME);
  } catch (err) {
    console.error('Failed to clear offline tile cache:', err);
    return false;
  }
}

/**
 * Custom Tile URL resolver that attempts CacheStorage first, then network,
 * with vector SVG fallback when in offline / dead zone mode.
 */
export async function getTileBlobUrl(url: string, isSimulatedOffline: boolean): Promise<string> {
  if ('caches' in window) {
    try {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      const match = await cache.match(url);
      if (match) {
        const blob = await match.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      // ignore
    }
  }

  if (isSimulatedOffline || !navigator.onLine) {
    // Generate an elegant SVG fallback tile for offline areas
    const svg = `
      <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
        <rect width="256" height="256" fill="#131722" stroke="#1f2937" stroke-width="1"/>
        <line x1="0" y1="128" x2="256" y2="128" stroke="#1f2937" stroke-width="0.5" stroke-dasharray="4,4"/>
        <line x1="128" y1="0" x2="128" y2="256" stroke="#1f2937" stroke-width="0.5" stroke-dasharray="4,4"/>
        <circle cx="128" cy="128" r="4" fill="#3b82f6" opacity="0.3"/>
        <text x="128" y="122" fill="#64748b" font-size="10" font-family="monospace" text-anchor="middle" font-weight="600">OFFLINE GRID</text>
        <text x="128" y="138" fill="#475569" font-size="8" font-family="sans-serif" text-anchor="middle">Safety Layer Active</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  return url;
}
