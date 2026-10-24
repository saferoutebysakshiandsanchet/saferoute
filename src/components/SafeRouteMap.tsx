import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { HazardDoc, HazardType, SafeRoutePlan } from '../types/saferoute';
import { soundFx } from '../utils/sound';
import { 
  Flame, 
  Layers, 
  Sliders, 
  Eye, 
  EyeOff, 
  Filter, 
  Info, 
  AlertTriangle 
} from 'lucide-react';

interface SafeRouteMapProps {
  hazards: HazardDoc[];
  activeRoute: SafeRoutePlan | null;
  selectedHazard: HazardDoc | null;
  onSelectHazard: (hazard: HazardDoc | null) => void;
  onMapClickCoordinates: (lat: number, lng: number) => void;
  userPosition: [number, number]; // [lat, lng]
  showPendingInMap: boolean;
  onUpvoteHazard: (hazardId: string) => void;
  tileTheme: 'streets' | 'dark' | 'satellite';
  isNavigating?: boolean;
  recenterTrigger?: number;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
}

export const SafeRouteMap: React.FC<SafeRouteMapProps> = ({
  hazards,
  activeRoute,
  selectedHazard,
  onSelectHazard,
  onMapClickCoordinates,
  userPosition,
  showPendingInMap,
  onUpvoteHazard,
  tileTheme,
  isNavigating = false,
  recenterTrigger = 0,
  showHeatmap,
  onToggleHeatmap,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const heatLayerRef = useRef<any>(null);

  // Heatmap Controls State
  const [showPinsWithHeatmap, setShowPinsWithHeatmap] = useState(true);
  const [heatmapRadius, setHeatmapRadius] = useState<number>(35);
  const [heatmapBlur, setHeatmapBlur] = useState<number>(24);
  const [heatmapFilterType, setHeatmapFilterType] = useState<string>('All');
  const [showHeatmapControls, setShowHeatmapControls] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center near Deccan / Shivaji Nagar (Pune)
    const map = L.map(mapContainerRef.current, {
      center: [18.5255, 73.8510],
      zoom: 15,
      zoomControl: false,
    });

    // Custom Zoom Control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Tile Layer
    const tileUrl = tileTheme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Click handler on map canvas to capture exact coordinates
    map.on('click', (e: L.LeafletMouseEvent) => {
      soundFx.playClick();
      onMapClickCoordinates(e.latlng.lat, e.latlng.lng);
    });

    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    // User position marker
    const userIcon = L.divIcon({
      className: 'user-gps-pulse-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(6, 182, 212, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 16px; height: 16px; border-radius: 9999px; background: #06b6d4; border: 3px solid #ffffff; box-shadow: 0 0 12px #06b6d4;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    userMarkerRef.current = L.marker(userPosition, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Theme when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    if (tileTheme === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (tileTheme === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    const newLayer = L.tileLayer(url, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [tileTheme]);

  // Update user position and auto-follow camera during GPS navigation
  useEffect(() => {
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userPosition);
    }
    if (isNavigating && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(userPosition, { animate: true, duration: 0.8 });
    }
  }, [userPosition, isNavigating]);

  // Recenter map when triggered by user
  useEffect(() => {
    if (recenterTrigger > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.setView(userPosition, 16, { animate: true });
    }
  }, [recenterTrigger]);

  // Render Leaflet.heat Heatmap Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing heatmap layer if present
    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!showHeatmap) return;

    // Filter hazards for heatmap
    const candidateHazards = hazards.filter((h) => {
      const statusMatch = h.status === 'Verified' || (showPendingInMap && h.status === 'Pending');
      const typeMatch = heatmapFilterType === 'All' || h.type === heatmapFilterType;
      return statusMatch && typeMatch;
    });

    // Generate [lat, lng, intensity] array
    const heatPoints: [number, number, number][] = candidateHazards.map((hazard) => {
      const [lng, lat] = hazard.location.coordinates;
      let intensity = 0.5;
      if (hazard.severity === 'High') intensity = 1.0;
      else if (hazard.severity === 'Medium') intensity = 0.65;
      else intensity = 0.35;

      // Slight boost for community-upvoted verified hazards
      intensity = Math.min(1.0, intensity + (hazard.upvotes * 0.015));
      return [lat, lng, intensity];
    });

    try {
      if (typeof (L as any).heatLayer === 'function') {
        const heat = (L as any).heatLayer(heatPoints, {
          radius: heatmapRadius,
          blur: heatmapBlur,
          maxZoom: 18,
          max: 1.0,
          minOpacity: 0.38,
          gradient: {
            0.15: '#06b6d4', // Cyan / Low Risk
            0.35: '#10b981', // Emerald / Low-Med
            0.55: '#f59e0b', // Amber / Warning
            0.75: '#f97316', // Orange / Elevated
            1.00: '#ef4444', // Crimson / High-Risk Density Cluster
          },
        });

        heat.addTo(mapInstanceRef.current);
        heatLayerRef.current = heat;
      }
    } catch (err) {
      console.error('Failed to instantiate Leaflet.heat layer:', err);
    }
  }, [hazards, showHeatmap, showPendingInMap, heatmapRadius, heatmapBlur, heatmapFilterType]);

  // Render Hazard Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    // If pins are hidden when heatmap is active, exit early
    if (showHeatmap && !showPinsWithHeatmap) {
      return;
    }

    const visibleHazards = hazards.filter((h) => 
      h.status === 'Verified' || (showPendingInMap && h.status === 'Pending')
    );

    visibleHazards.forEach((hazard) => {
      const [lng, lat] = hazard.location.coordinates;
      const isSelected = selectedHazard?.hazardId === hazard.hazardId;
      const isPending = hazard.status === 'Pending';

      // Colors based on type & severity
      let bgColor = '#ef4444'; // Red
      let iconSymbol = '⚠️';
      if (hazard.type === 'Unlit Street') {
        bgColor = '#f59e0b'; // Amber
        iconSymbol = '💡';
      } else if (hazard.type === 'Stray Animal Cluster') {
        bgColor = '#ea580c'; // Orange
        iconSymbol = '🐾';
      } else if (hazard.type === 'Cellular Dead Zone') {
        bgColor = '#dc2626'; // Red
        iconSymbol = '📵';
      } else if (hazard.type === 'Isolated Stretch') {
        bgColor = '#8b5cf6'; // Purple
        iconSymbol = '👁️';
      } else if (hazard.type === 'Flooded / Blocked Path') {
        bgColor = '#2563eb'; // Blue
        iconSymbol = '🚧';
      }

      const customIcon = L.divIcon({
        className: 'saferoute-hazard-icon',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isPending ? '<div style="position: absolute; inset: -4px; border-radius: 9999px; border: 2px dashed #f59e0b; animation: spin 4s linear infinite;"></div>' : ''}
            <div style="
              width: 30px; 
              height: 30px; 
              border-radius: 9999px; 
              background: ${bgColor}; 
              border: 2px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)'}; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 14px; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'};
              transition: transform 0.2s ease;
            ">
              ${iconSymbol}
            </div>
            ${hazard.source === 'IoT' ? '<span style="position: absolute; top: -3px; right: -3px; background: #06b6d4; color: #000; font-size: 8px; font-weight: 800; border-radius: 9999px; padding: 1px 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.5);">IoT</span>' : ''}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Click to select
      marker.on('click', () => {
        soundFx.playClick();
        onSelectHazard(hazard);
      });

      // Bind simple popup
      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; min-width: 180px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="font-size: 13px; color: #0f172a;">${hazard.type}</strong>
            <span style="font-size: 10px; font-weight: 700; background: ${hazard.status === 'Verified' ? '#dcfce7; color: #166534;' : '#fef3c7; color: #92400e;'} padding: 2px 6px; border-radius: 9999px;">${hazard.status}</span>
          </div>
          <p style="font-size: 11px; color: #475569; margin: 4px 0 6px 0;">${hazard.description}</p>
          <div style="font-size: 10px; color: #64748b; font-family: monospace;">
            Source: ${hazard.source} | Upvotes: ${hazard.upvotes}
          </div>
        </div>
      `);

      markersLayerRef.current?.addLayer(marker);
    });
  }, [hazards, selectedHazard, showPendingInMap, showHeatmap, showPinsWithHeatmap]);

  // Render Active Navigation Polyline
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;
    routeLayerRef.current.clearLayers();

    if (!activeRoute) return;

    const latLngs = activeRoute.coordinates;
    const isSafe = activeRoute.id === 'safe';

    // Outer glow line
    const outerPolyline = L.polyline(latLngs, {
      color: isSafe ? '#10b981' : '#f97316',
      weight: 10,
      opacity: 0.35,
      lineCap: 'round',
    });

    // Inner crisp line
    const innerPolyline = L.polyline(latLngs, {
      color: isSafe ? '#059669' : '#ea580c',
      weight: 5,
      dashArray: isSafe ? undefined : '10, 8',
      lineCap: 'round',
    });

    routeLayerRef.current.addLayer(outerPolyline);
    routeLayerRef.current.addLayer(innerPolyline);

    // Waypoint circle markers
    latLngs.forEach((coord, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === latLngs.length - 1;

      const wpIcon = L.divIcon({
        className: 'route-wp-icon',
        html: `
          <div style="
            width: ${isStart || isEnd ? '20px' : '14px'}; 
            height: ${isStart || isEnd ? '20px' : '14px'}; 
            border-radius: 9999px; 
            background: ${isStart ? '#10b981' : isEnd ? '#f59e0b' : '#ffffff'}; 
            border: 2px solid #0f172a; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 9px; 
            font-weight: 800; 
            color: #0f172a;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            ${isStart ? 'A' : isEnd ? 'B' : ''}
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const wpMarker = L.marker(coord, { icon: wpIcon });
      routeLayerRef.current?.addLayer(wpMarker);
    });
  }, [activeRoute]);

  const activePointsCount = hazards.filter((h) => {
    const statusMatch = h.status === 'Verified' || (showPendingInMap && h.status === 'Pending');
    const typeMatch = heatmapFilterType === 'All' || h.type === heatmapFilterType;
    return statusMatch && typeMatch;
  }).length;

  return (
    <div className="relative w-full h-full">
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 select-none" />

      {/* Top Left Watermark */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-1.5">
        <div className="tactical-glass-1 px-3 py-1.5 rounded-md text-[11px] font-mono-telemetry text-slate-200 border border-slate-700/60 shadow flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">LEAFLET + OSM</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400">2DSPHERE SPATIAL INDEX</span>
        </div>

        {/* Heatmap Active Notification Badge */}
        {showHeatmap && (
          <div className="tactical-glass-1 px-2.5 py-1 rounded-md text-[10px] font-mono-telemetry text-amber-300 border border-amber-500/40 shadow flex items-center gap-1.5 animate-in fade-in">
            <Flame size={12} className="text-amber-400 fill-amber-400 animate-pulse" />
            <span>HAZARD DENSITY HEATMAP ACTIVE ({activePointsCount} NODES)</span>
          </div>
        )}
      </div>

      {/* Floating Tactical Map Action Toolbar (Top Right below zoom controls) */}
      <div className="absolute top-24 right-3 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Heatmap Toggle Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onToggleHeatmap();
          }}
          title={showHeatmap ? 'Turn Off Hazard Heatmap' : 'Turn On Hazard Heatmap (Leaflet.heat)'}
          className={`px-3 py-2 rounded-xl text-xs font-mono-telemetry font-bold flex items-center gap-2 transition-all shadow-xl border cursor-pointer ${
            showHeatmap
              ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
              : 'tactical-glass-1 text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-500'
          }`}
        >
          <Flame size={16} className={showHeatmap ? 'fill-current animate-pulse' : ''} />
          <span>HEATMAP</span>
          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
            showHeatmap ? 'bg-black/40 text-amber-300' : 'bg-slate-800 text-slate-400'
          }`}>
            {showHeatmap ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Heatmap Settings / Density Control Toggle */}
        {showHeatmap && (
          <button
            onClick={() => {
              soundFx.playClick();
              setShowHeatmapControls((prev) => !prev);
            }}
            title="Configure Heatmap Density & Filters"
            className="px-2.5 py-1.5 rounded-lg tactical-glass-1 text-[11px] font-mono-telemetry text-slate-300 hover:text-cyan-300 border border-slate-700 flex items-center gap-1.5 shadow transition-colors"
          >
            <Sliders size={13} />
            <span>{showHeatmapControls ? 'Hide Controls' : 'Density Settings'}</span>
          </button>
        )}

        {/* Heatmap Configuration Flyout Box */}
        {showHeatmap && showHeatmapControls && (
          <div className="w-72 p-3.5 rounded-xl tactical-glass-2 border border-amber-500/40 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/70">
              <span className="text-xs font-bold text-white font-mono-telemetry flex items-center gap-1.5">
                <Flame size={14} className="text-amber-400" />
                HEATMAP TUNING
              </span>
              <span className="text-[10px] font-mono-telemetry text-cyan-400">
                Leaflet.heat v0.2
              </span>
            </div>

            {/* Filter by hazard type */}
            <div>
              <label className="block text-[10px] font-mono-telemetry text-slate-400 uppercase mb-1">
                Filter Cluster Type:
              </label>
              <select
                value={heatmapFilterType}
                onChange={(e) => setHeatmapFilterType(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono-telemetry text-white focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Hazard Categories ({hazards.length})</option>
                <option value="Unlit Street">💡 Unlit Streets Only</option>
                <option value="Stray Animal Cluster">🐾 Stray Animal Clusters Only</option>
                <option value="Cellular Dead Zone">📵 Cellular Dead Zones Only</option>
                <option value="Isolated Stretch">👁️ Isolated Stretches Only</option>
              </select>
            </div>

            {/* Radius Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono-telemetry text-slate-300 mb-1">
                <span>Cluster Blur Radius:</span>
                <span className="text-amber-400 font-bold">{heatmapRadius}px</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                step="1"
                value={heatmapRadius}
                onChange={(e) => setHeatmapRadius(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono-telemetry text-slate-500">
                <span>Pinpoint (15px)</span>
                <span>Wide (60px)</span>
              </div>
            </div>

            {/* Blur Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono-telemetry text-slate-300 mb-1">
                <span>Dispersion Blur:</span>
                <span className="text-cyan-400 font-bold">{heatmapBlur}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                step="1"
                value={heatmapBlur}
                onChange={(e) => setHeatmapBlur(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Pins visibility toggle */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] font-mono-telemetry text-slate-300">
                Show Pins with Heat:
              </span>
              <button
                onClick={() => setShowPinsWithHeatmap((p) => !p)}
                className={`px-2 py-1 rounded text-[10px] font-mono-telemetry font-bold border transition-colors ${
                  showPinsWithHeatmap
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {showPinsWithHeatmap ? 'PINS VISIBLE' : 'HEATMAP ONLY'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Heatmap Density Color Scale Legend (Bottom Right) */}
      {showHeatmap && (
        <div className="absolute bottom-4 right-4 z-20 hidden sm:flex flex-col gap-1.5 p-3 rounded-xl tactical-glass-1 border border-slate-700/80 text-[11px] font-mono-telemetry text-slate-300 shadow-2xl">
          <div className="flex items-center justify-between gap-3 text-xs font-bold text-white uppercase mb-0.5">
            <span className="flex items-center gap-1.5">
              <Flame size={14} className="text-amber-400" />
              HAZARD CLUSTER DENSITY
            </span>
          </div>

          {/* Color Gradient Bar */}
          <div className="w-56 h-3 rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 via-amber-400 via-orange-500 to-rose-600 border border-slate-700 shadow-inner" />

          {/* Scale Labels */}
          <div className="flex justify-between text-[10px] font-mono-telemetry text-slate-400">
            <span className="text-cyan-300">Low Risk</span>
            <span className="text-amber-300">Moderate</span>
            <span className="text-rose-400 font-bold">Severe Cluster</span>
          </div>

          <div className="pt-1.5 mt-0.5 border-t border-slate-700/60 text-[10px] text-slate-400">
            Weighted by severity level, frequency & upvotes
          </div>
        </div>
      )}
    </div>
  );
};
