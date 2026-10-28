import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  DownloadCloud, 
  Trash2, 
  CheckCircle2, 
  Database, 
  MapPin, 
  ShieldCheck, 
  X, 
  HardDrive,
  RefreshCw,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { 
  downloadAreaTiles, 
  getCachedTileCount, 
  clearOfflineTiles, 
  CacheProgress 
} from '../utils/offlineMapManager';
import { soundFx } from '../utils/sound';

interface OfflineMapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLat: number;
  currentLng: number;
  currentLocationName: string;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
}

export const OfflineMapsModal: React.FC<OfflineMapsModalProps> = ({
  isOpen,
  onClose,
  currentLat,
  currentLng,
  currentLocationName,
  isSimulatedOffline,
  onToggleSimulatedOffline,
}) => {
  const [cachedTiles, setCachedTiles] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<CacheProgress | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshCacheCount = async () => {
    const count = await getCachedTileCount();
    setCachedTiles(count);
  };

  useEffect(() => {
    if (isOpen) {
      refreshCacheCount();
      setDownloadSuccess(false);
      setDownloadProgress(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadCurrentArea = async () => {
    soundFx.playClick();
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      // Download tiles for zoom levels 14, 15, 16 around current position
      const result = await downloadAreaTiles(
        currentLat,
        currentLng,
        2, // 5x5 tile grid per zoom level
        [14, 15, 16],
        (prog) => setDownloadProgress(prog)
      );

      if (result.success) {
        soundFx.playWaypointPing();
        setDownloadSuccess(true);
        await refreshCacheCount();
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClearCache = async () => {
    soundFx.playClick();
    await clearOfflineTiles();
    await refreshCacheCount();
    setDownloadSuccess(false);
  };

  const estimatedMb = (cachedTiles * 0.035).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0f172a] rounded-3xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-lg">
              <HardDrive size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Offline Maps & Dead Zone Storage</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono-telemetry font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  CELLULAR RESILIENT
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cache safety maps directly on your device to navigate when cell signal drops
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)] no-scrollbar text-xs">
          {/* 1. Connection & Mode Status Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isSimulatedOffline || !isOnline
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {isSimulatedOffline || !isOnline ? <WifiOff size={18} /> : <Wifi size={18} />}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Current Network State:</span>
                  <span className={isSimulatedOffline || !isOnline ? 'text-amber-400' : 'text-emerald-400'}>
                    {isSimulatedOffline
                      ? 'Simulated Dead Zone (Offline)'
                      : isOnline
                      ? 'Online (Cellular / Wi-Fi Active)'
                      : 'No Internet Connection (Hardware Offline)'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {isSimulatedOffline || !isOnline
                    ? 'Map is serving stored offline vector tiles and cached safety routes'
                    : 'Real-time telemetry and public map server synchronized'}
                </div>
              </div>
            </div>

            {/* Toggle Dead Zone Simulator */}
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleSimulatedOffline();
              }}
              className={`px-3 py-1.5 rounded-xl font-mono-telemetry font-bold text-[10px] uppercase border transition-all cursor-pointer ${
                isSimulatedOffline
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              {isSimulatedOffline ? 'EXIT DEAD ZONE' : 'SIMULATE DEAD ZONE'}
            </button>
          </div>

          {/* 2. Cached Tile Storage Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/80 to-indigo-950/40 border border-slate-700/80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-telemetry font-bold text-slate-400 uppercase tracking-wider block">
                  DEVICE STORAGE RESERVED
                </span>
                <div className="text-2xl font-black text-white font-mono-telemetry mt-0.5 flex items-baseline gap-2">
                  <span>{cachedTiles}</span>
                  <span className="text-xs font-normal text-slate-400">Tiles Cached</span>
                  <span className="text-xs font-mono-telemetry text-cyan-400">({estimatedMb} MB)</span>
                </div>
              </div>

              {cachedTiles > 0 && (
                <button
                  onClick={handleClearCache}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 font-mono-telemetry text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Purge cached tiles to free memory"
                >
                  <Trash2 size={13} />
                  <span>Clear Cache</span>
                </button>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Database size={13} className="text-cyan-400" />
                Cache: <code className="text-slate-300">saferoute-offline-tiles-v1</code>
              </span>
              <span className="text-emerald-400 font-semibold">100% Client-Side Storage</span>
            </div>
          </div>

          {/* 3. Download Safety Map for Current Region */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <DownloadCloud size={15} className="text-emerald-400" />
                  <span>Download Area Safety Pack</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pre-downloads high-resolution raster tiles (zooms 14–16) around:
                </p>
                <div className="mt-1 flex items-center gap-1 text-slate-200 font-medium">
                  <MapPin size={13} className="text-rose-400 shrink-0" />
                  <span className="truncate max-w-[280px] font-semibold">{currentLocationName}</span>
                  <span className="text-[10px] font-mono-telemetry text-slate-400">
                    ({currentLat.toFixed(3)}, {currentLng.toFixed(3)})
                  </span>
                </div>
              </div>
            </div>

            {/* Download Progress Bar */}
            {isDownloading && downloadProgress && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono-telemetry text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw size={12} className="animate-spin text-cyan-400" />
                    Caching map tiles...
                  </span>
                  <span className="font-bold text-cyan-300">
                    {downloadProgress.completed} / {downloadProgress.total} ({downloadProgress.percent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-150"
                    style={{ width: `${downloadProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Confirmation */}
            {downloadSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2 text-emerald-300 text-xs">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Area safely stored! Offline navigation and hazard warnings are ready even without cellular data.</span>
              </div>
            )}

            {/* Download Action Button for Current Area */}
            <button
              disabled={isDownloading}
              onClick={handleDownloadCurrentArea}
              className={`w-full py-2.5 rounded-xl font-bold font-mono-telemetry text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isDownloading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-[0.99]'
              }`}
            >
              <DownloadCloud size={16} />
              <span>{isDownloading ? 'DOWNLOADING TILES...' : 'DOWNLOAD CURRENT GPS AREA'}</span>
            </button>

            {/* Quick Regional Packs Across India */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono-telemetry font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                🇮🇳 PAN-INDIA CITY OFFLINE PACKS
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
                  { name: 'Mumbai MMR', lat: 19.0760, lng: 72.8777 },
                  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
                  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
                  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
                  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
                  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
                  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
                ].map((city) => (
                  <button
                    key={city.name}
                    disabled={isDownloading}
                    onClick={async () => {
                      soundFx.playClick();
                      setIsDownloading(true);
                      setDownloadSuccess(false);
                      try {
                        const res = await downloadAreaTiles(city.lat, city.lng, 2, [14, 15], (p) =>
                          setDownloadProgress(p)
                        );
                        if (res.success) {
                          soundFx.playWaypointPing();
                          setDownloadSuccess(true);
                          await refreshCacheCount();
                        }
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsDownloading(false);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <DownloadCloud size={11} className="text-cyan-400 shrink-0" />
                    <span className="truncate">{city.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Academic Architecture Note */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-700/40 text-[11px] text-indigo-200/90 space-y-1.5">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase font-mono-telemetry text-[10px]">
              <Radio size={13} className="text-indigo-400" />
              <span>Academic Feasibility: Rs. 0 / $0 Zero-API-Cost Stack</span>
            </div>
            <p className="leading-relaxed">
              SafeRoute stores tiles in the browser's native CacheStorage API. Turn-by-turn Haversine algorithms, route safety scoring, and verified hazard buffers run locally on-device via Virtual DOM diffing.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
