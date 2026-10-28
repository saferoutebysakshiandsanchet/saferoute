import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { LocationPoint, HazardDoc, HazardType, SafeRoutePlan } from '../types/saferoute';
import { soundFx } from '../utils/sound';
import { 
  Flame, 
  Layers, 
  Sliders, 
  Eye, 
  EyeOff, 
  Filter, 
  Info, 
  AlertTriangle,
  MapPin,
  Navigation
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
  origin?: LocationPoint;
  destination?: LocationPoint;
  pickingMode?: 'origin' | 'destination' | null;
  onCancelPickingMode?: () => void;
  isSimulatedOffline?: boolean;
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
  origin,
  destination,
  pickingMode,
  onCancelPickingMode,
  isSimulatedOffline = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const heatLayerRef = useRef<any>(null);

  // Offline SVG Tile Pattern
  const offlineSvgTile = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
      <line x1="0" y1="128" x2="256" y2="128" stroke="#1e293b" stroke-width="0.5" stroke-dasharray="4,4"/>
      <line x1="128" y1="0" x2="128" y2="256" stroke="#1e293b" stroke-width="0.5" stroke-dasharray="4,4"/>
      <text x="128" y="125" fill="#64748b" font-size="10" font-family="monospace" text-anchor="middle" font-weight="700">OFFLINE GRID</text>
      <text x="128" y="142" fill="#06b6d4" font-size="9" font-family="sans-serif" text-anchor="middle">Safety Layer Active</text>
    </svg>`
  )}`;

  // Heatmap Controls State
  const [showPinsWithHeatmap, setShowPinsWithHeatmap] = useState(true);
  const [heatmapRadius, setHeatmapRadius] = useState<number>(35);
  const [heatmapBlur, setHeatmapBlur] = useState<number>(24);
  const [heatmapFilterType, setHeatmapFilterType] = useState<string>('All');
  const [showHeatmapControls, setShowHeatmapControls] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center near Deccan / Shivaji Nagar (Pune) or user position
    const map = L.map(mapContainerRef.current, {
      center: userPosition || [18.5255, 73.8510],
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
      errorTileUrl: offlineSvgTile,
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
      errorTileUrl: offlineSvgTile,
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
      mapInstanceRef.current.flyTo(userPosition, 16, { animate: true, duration: 1.0 });
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
      } else if (hazard.type === 'Waterlogging / Heavy Rain') {
        bgColor = '#0284c7'; // Cyan/Blue
        iconSymbol = '🌊';
      } else if (hazard.type === 'Dense Fog / Low Visibility') {
        bgColor = '#475569'; // Foggy Slate
        iconSymbol = '🌫️';
      } else if (hazard.type === 'Severe Weather Alert') {
        bgColor = '#d97706'; // Amber Storm
        iconSymbol = '⛈️';
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
            ${hazard.source === 'Weather' ? '<span style="position: absolute; top: -3px; right: -3px; background: #38bdf8; color: #000; font-size: 8px; font-weight: 800; border-radius: 9999px; padding: 1px 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.5);">WX</span>' : ''}
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

    // Google Maps style Start & Destination markers + waypoints
    latLngs.forEach((coord, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === latLngs.length - 1;

      if (isStart) {
        // Start Location Marker (Green Google Maps Origin Badge)
        const startIcon = L.divIcon({
          className: 'google-maps-start-marker',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
              <div style="display: flex; align-items: center; gap: 3px; background: #0f172a; color: #10b981; border: 1.5px solid #10b981; padding: 2px 7px; border-radius: 9999px; font-size: 10px; font-weight: 800; font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.6); margin-bottom: 2px; white-space: nowrap;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: #10b981;"></span>
                <span>START: ${origin?.name || 'Your Location'}</span>
              </div>
              <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(16, 185, 129, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="width: 16px; height: 16px; border-radius: 9999px; background: #10b981; border: 3px solid #ffffff; box-shadow: 0 0 12px #10b981;"></div>
              </div>
            </div>
          `,
          iconSize: [120, 48],
          iconAnchor: [60, 40],
        });

        const startMarker = L.marker(coord, { icon: startIcon, zIndexOffset: 800 });
        startMarker.bindPopup(`<strong>Start Location</strong><br/>${origin?.name || 'Origin'}<br/><span style="font-size:10px; color:#64748b;">${origin?.address || ''}</span>`);
        routeLayerRef.current?.addLayer(startMarker);
      } else if (isEnd) {
        // Destination Marker (Iconic Red Teardrop Pin)
        const destIcon = L.divIcon({
          className: 'google-maps-dest-marker',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
              <div style="display: flex; align-items: center; gap: 3px; background: #0f172a; color: #f43f5e; border: 1.5px solid #f43f5e; padding: 2px 7px; border-radius: 9999px; font-size: 10px; font-weight: 800; font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.6); margin-bottom: 2px; white-space: nowrap;">
                <span>DEST: ${destination?.name || 'Destination'}</span>
              </div>
              <svg width="28" height="36" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.6));">
                <path d="M12 0C5.37258 0 0 5.37258 0 12C0 19.5 12 32 12 32C12 32 24 19.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="#ef4444"/>
                <circle cx="12" cy="11" r="5" fill="#ffffff"/>
              </svg>
            </div>
          `,
          iconSize: [130, 60],
          iconAnchor: [65, 58],
        });

        const destMarker = L.marker(coord, { icon: destIcon, zIndexOffset: 900 });
        destMarker.bindPopup(`<strong>Destination</strong><br/>${destination?.name || 'Destination'}<br/><span style="font-size:10px; color:#64748b;">${destination?.address || ''}</span>`);
        routeLayerRef.current?.addLayer(destMarker);
      } else {
        // Intermediate Waypoint Bullet
        const wpIcon = L.divIcon({
          className: 'route-wp-icon',
          html: `
            <div style="
              width: 14px; 
              height: 14px; 
              border-radius: 9999px; 
              background: #ffffff; 
              border: 2px solid #0f172a; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 8px; 
              font-weight: 800; 
              color: #0f172a;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
              ${idx}
            </div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const wpMarker = L.marker(coord, { icon: wpIcon });
        routeLayerRef.current?.addLayer(wpMarker);
      }
    });

    // Auto fit map view to entire route if not in active navigation
    if (!isNavigating && latLngs.length > 1) {
      try {
        const bounds = L.latLngBounds(latLngs);
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [activeRoute, origin, destination, isNavigating]);

  const activePointsCount = hazards.filter((h) => {
    const statusMatch = h.status === 'Verified' || (showPendingInMap && h.status === 'Pending');
    const typeMatch = heatmapFilterType === 'All' || h.type === heatmapFilterType;
    return statusMatch && typeMatch;
  }).length;

  return (
    <div className="relative w-full h-full">
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 select-none" />

      {/* Google Maps Map Picking Mode Overlay Banner */}
      {pickingMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-emerald-300 animate-bounce pointer-events-auto">
          <MapPin size={18} className="fill-current text-slate-950" />
          <span className="text-xs uppercase tracking-wider font-extrabold font-mono-telemetry">
            TAP ON MAP TO SET {pickingMode === 'origin' ? 'START LOCATION' : 'DESTINATION'}
          </span>
          {onCancelPickingMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                onCancelPickingMode();
              }}
              className="px-2 py-0.5 rounded-full bg-slate-950 text-white text-[10px] font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      )}

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
