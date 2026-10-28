import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown, 
  Crosshair, 
  Plus, 
  X, 
  Building2, 
  Train, 
  GraduationCap, 
  Compass, 
  CheckCircle2,
  Sparkles,
  LocateFixed,
  CornerDownRight,
  Globe2,
  Loader2
} from 'lucide-react';
import { SafeRoutePlan, LocationPoint } from '../types/saferoute';
import { PRESET_LOCATIONS, MAJOR_INDIAN_CITIES, IndianCity, getLocationsByCity } from '../data/landmarks';
import { calculateDistanceKm } from '../utils/routePlanner';
import { soundFx } from '../utils/sound';

interface GPSSearchSheetProps {
  origin: LocationPoint;
  destination: LocationPoint;
  onSelectOrigin: (loc: LocationPoint) => void;
  onSelectDestination: (loc: LocationPoint) => void;
  onSwapLocations: () => void;
  onUseCurrentLocation: () => void;
  onPickOnMap: (target: 'origin' | 'destination') => void;
  safeRoute: SafeRoutePlan;
  shortestRoute: SafeRoutePlan;
  activeRoute: SafeRoutePlan | null;
  onSelectRoute: (route: SafeRoutePlan) => void;
  onStartGPS: () => void;
  onOpenReportModal: () => void;
  onToggleHeatmap: () => void;
  isHeatmapActive: boolean;
  onRecenter: () => void;
  userPosition: [number, number];
  isLocating?: boolean;
  onSelectCity?: (city: IndianCity) => void;
  activeCityId?: string;
}

export const GPSSearchSheet: React.FC<GPSSearchSheetProps> = ({
  origin,
  destination,
  onSelectOrigin,
  onSelectDestination,
  onSwapLocations,
  onUseCurrentLocation,
  onPickOnMap,
  safeRoute,
  shortestRoute,
  activeRoute,
  onSelectRoute,
  onStartGPS,
  onOpenReportModal,
  onToggleHeatmap,
  isHeatmapActive,
  onRecenter,
  userPosition,
  isLocating = false,
  onSelectCity,
  activeCityId = 'all',
}) => {
  // Direct text input states for Start & Destination
  const [startQuery, setStartQuery] = useState(origin.name);
  const [destQuery, setDestQuery] = useState(destination.name);
  
  // Track which input currently has focus: 'origin' | 'destination' | null
  const [activeField, setActiveField] = useState<'origin' | 'destination' | null>(null);
  const [showStepDetails, setShowStepDetails] = useState(false);
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>(activeCityId);

  // Live Pan-India OpenStreetMap Geocoding state
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState<LocationPoint[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const startInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync text inputs when external origin/destination changes (unless user is actively typing)
  useEffect(() => {
    if (activeField !== 'origin') {
      setStartQuery(origin.name);
    }
  }, [origin, activeField]);

  useEffect(() => {
    if (activeField !== 'destination') {
      setDestQuery(destination.name);
    }
  }, [destination, activeField]);

  // Click outside listener to dismiss suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentRoute = activeRoute || safeRoute;
  const isSafeSelected = currentRoute.id === 'safe';

  // Active search query based on which input has focus
  const currentQuery = activeField === 'origin' ? startQuery : destQuery;

  // Real-time Nationwide Geocoding using OpenStreetMap Nominatim API (filtered to India)
  useEffect(() => {
    if (!activeField) {
      setLiveSearchResults([]);
      return;
    }

    const query = currentQuery.trim();
    if (query.length < 2) {
      setLiveSearchResults([]);
      setIsGeocoding(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(
            query
          )}&limit=6&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const results: LocationPoint[] = data.map((item: any) => {
            const cityName =
              item.address?.city ||
              item.address?.town ||
              item.address?.suburb ||
              item.address?.state_district ||
              item.address?.state ||
              'India';

            const displayName =
              item.name ||
              item.display_name.split(',')[0] ||
              item.address?.road ||
              'Location';

            return {
              id: `osm-${item.place_id}`,
              name: displayName,
              category: 'landmark' as const,
              address: item.display_name,
              coordinates: [parseFloat(item.lat), parseFloat(item.lon)],
              isSafeHaven: item.type === 'hospital' || item.type === 'police' || item.type === 'university',
              city: cityName,
              state: item.address?.state,
            };
          });

          setLiveSearchResults(results);
        }
      } catch (err) {
        console.warn('Live geocoding error or offline:', err);
      } finally {
        setIsGeocoding(false);
      }
    }, 320);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentQuery, activeField]);

  // Filter preset locations matching query and selected city
  const filteredPresets = PRESET_LOCATIONS.filter((loc) => {
    if (loc.id === 'loc-current') return false; // Handled separately as top button
    
    // City filter
    if (selectedCityFilter !== 'all' && loc.city !== selectedCityFilter) {
      return false;
    }

    if (!currentQuery.trim()) return true;
    const q = currentQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.address.toLowerCase().includes(q) ||
      (loc.city && loc.city.toLowerCase().includes(q)) ||
      (loc.state && loc.state.toLowerCase().includes(q))
    );
  });

  // Dynamic Custom Location Creation based on search query and current user / live geocode position
  const createCustomLocation = (name: string): LocationPoint => {
    // If live search returned a result, use top geocoded result
    if (liveSearchResults.length > 0) {
      return liveSearchResults[0];
    }

    // Otherwise generate clean relative coordinate around current user's actual position
    const [baseLat, baseLng] = userPosition;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash << 5) - hash + name.charCodeAt(i);
      hash |= 0;
    }
    const offsetLat = ((Math.abs(hash) % 150) - 75) * 0.0001;
    const offsetLng = ((Math.abs(hash >> 3) % 150) - 75) * 0.0001;
    const lat = baseLat + offsetLat;
    const lng = baseLng + offsetLng;

    return {
      id: `custom-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      category: 'custom',
      address: `${name.trim()} (Direct Search Target)`,
      coordinates: [parseFloat(lat.toFixed(4)), parseFloat(lng.toFixed(4))],
      isSafeHaven: false,
    };
  };

  const handleSelectLocation = (loc: LocationPoint) => {
    soundFx.playClick();
    if (activeField === 'origin') {
      if (loc.id === 'loc-current') {
        onUseCurrentLocation();
      } else {
        onSelectOrigin(loc);
        setStartQuery(loc.name);
      }
    } else {
      onSelectDestination(loc);
      setDestQuery(loc.name);
    }
    setActiveField(null);
  };

  const handleCommitCustomLocation = (typedText: string) => {
    if (!typedText.trim()) return;
    const custom = createCustomLocation(typedText);
    soundFx.playClick();
    if (activeField === 'origin') {
      onSelectOrigin(custom);
      setStartQuery(custom.name);
    } else {
      onSelectDestination(custom);
      setDestQuery(custom.name);
    }
    setActiveField(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'campus':
        return <GraduationCap size={15} className="text-emerald-400" />;
      case 'transit':
        return <Train size={15} className="text-cyan-400" />;
      case 'commercial':
        return <Building2 size={15} className="text-amber-400" />;
      case 'current':
        return <Crosshair size={15} className="text-cyan-400 animate-pulse" />;
      default:
        return <MapPin size={15} className="text-slate-400" />;
    }
  };

  // Popular Pan-India Quick Destination Hubs
  const popularPresets = [
    { label: 'Delhi CP', id: 'delhi-cp', city: 'Delhi' },
    { label: 'Mumbai CSMT', id: 'mumbai-csmt', city: 'Mumbai' },
    { label: 'BLR Majestic', id: 'blr-majestic', city: 'Bengaluru' },
    { label: 'HYD Cyber Towers', id: 'hyd-cyber-towers', city: 'Hyderabad' },
    { label: 'Chennai Central', id: 'chn-central', city: 'Chennai' },
    { label: 'Kolkata Howrah', id: 'kol-howrah', city: 'Kolkata' },
    { label: 'Pune FC Road', id: 'loc-fc-road', city: 'Pune' },
  ];

  return (
    <>
      {/* 1. TOP GOOGLE MAPS STYLE DIRECTIONS & EDITABLE SEARCH PANEL */}
      <div 
        ref={containerRef}
        className="absolute top-3 left-3 right-3 md:left-6 md:right-auto md:w-[500px] z-30 pointer-events-auto"
      >
        <div className="bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-slate-700/80">
          <div className="flex items-center gap-2">
            {/* Visual Dot & Connecting Line on Left */}
            <div className="flex flex-col items-center justify-between py-2 w-5 shrink-0 self-stretch">
              {/* Origin Circle Dot (Green) */}
              <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 bg-emerald-500/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              {/* Dotted Connecting Line */}
              <div className="w-0.5 flex-1 my-1 border-l-2 border-dotted border-slate-500" />
              {/* Destination Pin (Red) */}
              <MapPin size={16} className="text-rose-500 fill-rose-500 shrink-0" />
            </div>

            {/* Middle: Interactive Direct Text Input Fields */}
            <div className="flex-1 flex flex-col gap-1.5">
              {/* Row 1: Start Location Direct Editable Input */}
              <div className={`relative flex items-center bg-slate-900/90 rounded-xl px-2.5 py-1 border transition-all ${
                activeField === 'origin' ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-slate-900' : 'border-slate-700/80 hover:border-slate-600'
              }`}>
                <span className="text-[10px] font-mono-telemetry font-bold text-emerald-400 mr-2 shrink-0">
                  START:
                </span>
                <input
                  ref={startInputRef}
                  type="text"
                  value={startQuery}
                  onFocus={() => {
                    setActiveField('origin');
                    soundFx.playClick();
                  }}
                  onChange={(e) => setStartQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCommitCustomLocation(startQuery);
                    }
                  }}
                  placeholder="Search any Indian address or tap GPS..."
                  className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none placeholder-slate-500 truncate"
                />

                {/* Right actions inside Start row: Clear (X) and Quick GPS button */}
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {startQuery && activeField === 'origin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setStartQuery('');
                        startInputRef.current?.focus();
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
                      title="Clear Start Location"
                    >
                      <X size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      onUseCurrentLocation();
                      setStartQuery('Your Current Location');
                      setActiveField(null);
                    }}
                    title="Lock Hardware Device GPS"
                    className="px-1.5 py-0.5 rounded text-[9px] font-mono-telemetry font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <LocateFixed size={10} className={isLocating ? 'animate-spin' : ''} />
                    <span>GPS</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Destination Direct Editable Input */}
              <div className={`relative flex items-center bg-slate-900/90 rounded-xl px-2.5 py-1 border transition-all ${
                activeField === 'destination' ? 'border-rose-500 ring-2 ring-rose-500/30 bg-slate-900' : 'border-slate-700/80 hover:border-slate-600'
              }`}>
                <span className="text-[10px] font-mono-telemetry font-bold text-rose-400 mr-2 shrink-0">
                  DEST:
                </span>
                <input
                  ref={destInputRef}
                  type="text"
                  value={destQuery}
                  onFocus={() => {
                    setActiveField('destination');
                    soundFx.playClick();
                  }}
                  onChange={(e) => setDestQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCommitCustomLocation(destQuery);
                    }
                  }}
                  placeholder="Enter destination, landmark or transit hub in India..."
                  className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none placeholder-slate-500 truncate"
                />

                {/* Right actions inside Dest row: Safe haven badge and Clear (X) */}
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {destQuery && activeField === 'destination' && (
                    <button
                      type="button"
                      onClick={() => {
                        setDestQuery('');
                        destInputRef.current?.focus();
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
                      title="Clear Destination"
                    >
                      <X size={13} />
                    </button>
                  )}
                  {destination.isSafeHaven && activeField !== 'destination' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-telemetry font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      SAFE
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Swap Start & Destination Button (⇅) */}
            <button
              onClick={() => {
                soundFx.playClick();
                onSwapLocations();
              }}
              title="Swap Start & Destination"
              className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shadow flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <ArrowUpDown size={17} className="text-emerald-400" />
            </button>
          </div>

          {/* Quick Suggestions Chips Bar: Pan-India Quick Presets */}
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
            {/* Quick "My Location" chip */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onUseCurrentLocation();
                setStartQuery('Your Current Location');
                setActiveField(null);
              }}
              className="px-2.5 py-1 rounded-full bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-600/40 text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LocateFixed size={12} className={isLocating ? 'animate-spin' : ''} />
              <span>Current GPS</span>
            </button>

            {/* Quick Pan-India Destination Chips */}
            {popularPresets.map((preset) => {
              const target = PRESET_LOCATIONS.find((l) => l.id === preset.id);
              if (!target) return null;
              const isCurrentDest = destination.id === target.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    if (activeField === 'origin') {
                      onSelectOrigin(target);
                      setStartQuery(target.name);
                    } else {
                      onSelectDestination(target);
                      setDestQuery(target.name);
                    }
                    setActiveField(null);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    isCurrentDest
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/70'
                  }`}
                >
                  <MapPin size={11} className={isCurrentDest ? 'text-rose-400 fill-rose-400' : 'text-slate-400'} />
                  <span>{preset.label}</span>
                </button>
              );
            })}

            {/* Pick on Map chip */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                const target = activeField || 'destination';
                setActiveField(null);
                onPickOnMap(target);
              }}
              className="px-2.5 py-1 rounded-full bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-600/40 text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer transition-colors"
            >
              <MapPin size={12} />
              <span>Pick on Map</span>
            </button>
          </div>

          {/* Quick Route Mode & Heatmap Toggles Bar */}
          <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {/* SafeRoute toggle */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  onSelectRoute(safeRoute);
                }}
                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSafeSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <ShieldCheck size={13} />
                <span>SafeRoute ({safeRoute.safetyScore}%)</span>
              </button>

              {/* Shortest Route toggle */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  onSelectRoute(shortestRoute);
                }}
                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  !isSafeSelected
                    ? 'bg-rose-500 text-white font-bold shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Clock size={13} />
                <span>Shortest ({shortestRoute.durationMinutes}m)</span>
              </button>
            </div>

            {/* Heatmap Layer toggle */}
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleHeatmap();
              }}
              className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer ${
                isHeatmapActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Flame size={13} className={isHeatmapActive ? 'fill-current' : ''} />
              <span>{isHeatmapActive ? 'Heatmap ON' : 'Heatmap'}</span>
            </button>
          </div>
        </div>

        {/* 2. FLOATING AUTOCOMPLETE & PRESET SUGGESTIONS DROPDOWN (Google Maps Style + Pan-India Geocoding) */}
        {activeField && (
          <div className="mt-2 bg-[#0f172a] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden text-white animate-in fade-in slide-in-from-top-2 max-h-[65vh] flex flex-col z-50">
            {/* Header info */}
            <div className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Compass size={14} className={activeField === 'origin' ? 'text-emerald-400' : 'text-rose-400'} />
                <span>Selecting {activeField === 'origin' ? 'Start Location' : 'Destination'} in India</span>
              </span>
              <div className="flex items-center gap-2">
                {isGeocoding && (
                  <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono-telemetry">
                    <Loader2 size={11} className="animate-spin" /> Searching India...
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setActiveField(null)}
                  className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* City Filter Chips Bar */}
            <div className="px-3 py-1.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              <span className="text-[10px] font-mono-telemetry font-bold text-slate-400 shrink-0">
                REGION:
              </span>
              {MAJOR_INDIAN_CITIES.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedCityFilter(city.id);
                    if (onSelectCity && city.id !== 'all') {
                      onSelectCity(city);
                    }
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCityFilter === city.id
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800/90 hover:bg-slate-750 text-slate-300'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>

            {/* Top Quick Actions: Current GPS & Choose on Map */}
            <div className="p-2 border-b border-slate-800 grid grid-cols-2 gap-2 bg-slate-900/60">
              {/* Option A: Use Current Location */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onUseCurrentLocation();
                  if (activeField === 'origin') {
                    setStartQuery('Your Current Location');
                  } else {
                    onSelectDestination({
                      id: 'loc-current',
                      name: 'Your Current Location',
                      category: 'current',
                      address: 'Live GPS Sensor Position',
                      coordinates: userPosition,
                      isSafeHaven: false,
                    });
                    setDestQuery('Your Current Location');
                  }
                  setActiveField(null);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 hover:bg-cyan-950/40 border border-slate-700/80 text-left flex items-center gap-2 transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Crosshair size={16} className="group-hover:scale-110 transition-transform" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                    Your Current Location
                  </div>
                  <div className="text-[10px] text-slate-400">Lock Device GPS</div>
                </div>
              </button>

              {/* Option B: Choose on Map */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  const target = activeField;
                  setActiveField(null);
                  onPickOnMap(target);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 hover:bg-amber-950/40 border border-slate-700/80 text-left flex items-center gap-2 transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="group-hover:scale-110 transition-transform" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                    Choose on Map
                  </div>
                  <div className="text-[10px] text-slate-400">Tap any road in India</div>
                </div>
              </button>
            </div>

            {/* Option C: Direct search query submit button */}
            {currentQuery.trim() && (
              <div
                onClick={() => handleCommitCustomLocation(currentQuery)}
                className="px-3 py-2.5 bg-emerald-950/40 hover:bg-emerald-900/60 border-b border-emerald-900/50 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CornerDownRight size={13} />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-white truncate block">
                      Search & Route to "{currentQuery.trim()}"
                    </span>
                    <span className="text-[10px] text-emerald-400/90 block">
                      Press Enter or tap to route to this location in India
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono-telemetry font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full shrink-0">
                  SET
                </span>
              </div>
            )}

            {/* List of Results: Live Nominatim India Results (if query) + Filtered Presets */}
            <div className="flex-1 overflow-y-auto p-1.5 divide-y divide-slate-800/80 text-xs no-scrollbar">
              {/* 1. Live Pan-India Geocoded Results */}
              {liveSearchResults.length > 0 && (
                <div className="mb-2">
                  <div className="px-2.5 py-1 text-[10px] font-mono-telemetry font-bold text-cyan-400 uppercase flex items-center gap-1">
                    <Globe2 size={11} />
                    <span>Nationwide Live Results (India)</span>
                  </div>
                  {liveSearchResults.map((loc) => {
                    const distFromUser = calculateDistanceKm(userPosition, loc.coordinates);
                    return (
                      <div
                        key={loc.id}
                        onClick={() => handleSelectLocation(loc)}
                        className="p-2.5 rounded-xl hover:bg-cyan-950/30 flex items-center justify-between cursor-pointer transition-all border border-transparent hover:border-cyan-500/30"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-xl bg-cyan-950/50 text-cyan-400 border border-cyan-800/50 flex items-center justify-center shrink-0">
                            <MapPin size={15} />
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white truncate">
                                {loc.name}
                              </span>
                              {loc.city && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono-telemetry font-bold bg-slate-800 text-cyan-300 shrink-0">
                                  {loc.city}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {loc.address}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-2">
                          <span className="text-[11px] font-mono-telemetry font-bold text-slate-300">
                            {distFromUser} km
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. Verified Safety Presets */}
              <div>
                <div className="px-2.5 py-1 text-[10px] font-mono-telemetry font-bold text-slate-400 uppercase flex items-center gap-1">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  <span>
                    Verified Safe Havens & Transit Spines
                    {selectedCityFilter !== 'all' ? ` (${selectedCityFilter.toUpperCase()})` : ' (PAN-INDIA)'}
                  </span>
                </div>

                {filteredPresets.length > 0 ? (
                  filteredPresets.map((loc) => {
                    const isSelected =
                      activeField === 'origin'
                        ? origin.id === loc.id
                        : destination.id === loc.id;
                    const distFromUser = calculateDistanceKm(userPosition, loc.coordinates);

                    return (
                      <div
                        key={loc.id}
                        onClick={() => handleSelectLocation(loc)}
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 border border-emerald-500/40'
                            : 'hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                            {getCategoryIcon(loc.category)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white truncate">
                                {loc.name}
                              </span>
                              {loc.isSafeHaven && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono-telemetry font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                                  SAFE
                                </span>
                              )}
                              {loc.city && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono-telemetry font-bold bg-slate-800 text-slate-400 shrink-0 uppercase">
                                  {loc.city}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {loc.address}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-2">
                          <span className="text-[11px] font-mono-telemetry font-bold text-slate-300">
                            {distFromUser} km
                          </span>
                          {isSelected && (
                            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 justify-end">
                              <CheckCircle2 size={11} /> Selected
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    <p>No presets found matching "{currentQuery}".</p>
                    <p className="mt-1 text-emerald-400 font-semibold">
                      Press Enter or tap "Search & Route to '{currentQuery}'" above!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. FLOATING GPS RECENTER & REPORT BUTTONS (Right side) */}
      <div className="absolute right-3 top-44 z-20 flex flex-col gap-2.5 pointer-events-auto">
        {/* "Use My Location" Quick GPS Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onUseCurrentLocation();
          }}
          title="Use My Current GPS Location as Start"
          className="w-12 h-12 rounded-2xl bg-[#0f172a] text-emerald-400 hover:text-white border border-emerald-500/40 shadow-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer relative"
        >
          <Navigation size={20} className={`fill-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          )}
        </button>

        {/* Recenter Map Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onRecenter();
          }}
          title="Recenter Map on Current Position"
          className="w-12 h-12 rounded-2xl bg-[#0f172a] text-cyan-400 hover:text-white border border-slate-700 shadow-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Crosshair size={22} />
        </button>

        {/* Quick Report Hazard Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenReportModal();
          }}
          title="Report a Hazard at Location"
          className="w-12 h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border border-amber-300 shadow-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* 4. BOTTOM DESTINATION & START GPS SHEET (Google Maps style) */}
      <div className="absolute bottom-3 left-3 right-3 md:left-6 md:right-auto md:w-[500px] z-20 pointer-events-auto">
        <div className="bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-slate-700/80 text-white flex flex-col gap-3">
          {/* Destination Header */}
          <div className="flex items-start justify-between">
            <div className="overflow-hidden pr-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate">
                  {destination.name}
                </h3>
                {destination.isSafeHaven && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                    VERIFIED SAFE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {destination.address} &bull; {currentRoute.distanceKm} km away
              </p>
            </div>

            <button
              onClick={() => setShowStepDetails((s) => !s)}
              className="text-slate-400 hover:text-white p-1 rounded-lg shrink-0 cursor-pointer"
              title="Preview Steps"
            >
              {showStepDetails ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>

          {/* Route Option Cards (Side by Side) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Option 1: SafeRoute */}
            <div
              onClick={() => {
                soundFx.playClick();
                onSelectRoute(safeRoute);
              }}
              className={`p-3 rounded-xl cursor-pointer border transition-all ${
                isSafeSelected
                  ? 'bg-emerald-500/15 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={13} />
                  SafeRoute
                </span>
                <span className="text-xs font-black text-white">
                  {safeRoute.durationMinutes} min
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {safeRoute.distanceKm} km &bull; 0 Hazards
              </div>
              <div className="mt-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/60 inline-block">
                Score: {safeRoute.safetyScore}/100
              </div>
            </div>

            {/* Option 2: Shortest */}
            <div
              onClick={() => {
                soundFx.playClick();
                onSelectRoute(shortestRoute);
              }}
              className={`p-3 rounded-xl cursor-pointer border transition-all ${
                !isSafeSelected
                  ? 'bg-rose-500/15 border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <AlertTriangle size={13} />
                  Shortest
                </span>
                <span className="text-xs font-black text-white">
                  {shortestRoute.durationMinutes} min
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {shortestRoute.distanceKm} km &bull; {shortestRoute.safetyScore < 60 ? 'Hazard Risk' : 'Direct'}
              </div>
              <div className="mt-1.5 text-[10px] font-bold text-rose-300 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-800/60 inline-block">
                Score: {shortestRoute.safetyScore}/100
              </div>
            </div>
          </div>

          {/* Expandable Step-by-Step Preview */}
          {showStepDetails && (
            <div className="max-h-48 overflow-y-auto space-y-2 py-2 border-t border-slate-800 text-xs no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                ROUTE DIRECTIONS PREVIEW
              </span>
              {currentRoute.waypoints.map((wp, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-white">{wp.instruction}</div>
                    <div className="text-[11px] text-slate-400">{wp.street}</div>
                    {wp.safeNote && (
                      <div className="text-[10px] text-emerald-400 mt-0.5">✓ {wp.safeNote}</div>
                    )}
                    {wp.hazardWarning && (
                      <div className="text-[10px] text-rose-400 mt-0.5">{wp.hazardWarning}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BIG PROMINENT "START NAVIGATION" GPS BUTTON (Google Maps Green CTA) */}
          <button
            onClick={() => {
              soundFx.playWaypointPing();
              onStartGPS();
            }}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-base uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
          >
            <Navigation size={20} className="fill-current rotate-45" />
            <span>START NAVIGATION</span>
          </button>
        </div>
      </div>
    </>
  );
};
