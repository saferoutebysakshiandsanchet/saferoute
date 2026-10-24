import React, { useState } from 'react';
import { 
  Search, 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Flame, 
  Footprints, 
  Lightbulb, 
  Dog, 
  Radio, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Crosshair,
  Plus
} from 'lucide-react';
import { SafeRoutePlan } from '../types/saferoute';
import { soundFx } from '../utils/sound';

interface GPSSearchSheetProps {
  safeRoute: SafeRoutePlan;
  shortestRoute: SafeRoutePlan;
  activeRoute: SafeRoutePlan | null;
  onSelectRoute: (route: SafeRoutePlan) => void;
  onStartGPS: () => void;
  onOpenReportModal: () => void;
  onToggleHeatmap: () => void;
  isHeatmapActive: boolean;
  onRecenter: () => void;
}

export const GPSSearchSheet: React.FC<GPSSearchSheetProps> = ({
  safeRoute,
  shortestRoute,
  activeRoute,
  onSelectRoute,
  onStartGPS,
  onOpenReportModal,
  onToggleHeatmap,
  isHeatmapActive,
  onRecenter,
}) => {
  const [searchQuery, setSearchQuery] = useState('College Main Gate (Safe Haven)');
  const [showStepDetails, setShowStepDetails] = useState(false);

  const currentRoute = activeRoute || safeRoute;
  const isSafeSelected = currentRoute.id === 'safe';

  return (
    <>
      {/* 1. TOP FLOATING GOOGLE-MAPS SEARCH BAR */}
      <div className="absolute top-3 left-3 right-3 md:left-6 md:right-auto md:w-[460px] z-20 pointer-events-auto">
        <div className="bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl p-2.5 shadow-2xl border border-slate-700/80">
          <div className="flex items-center gap-2.5 px-2">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination, campus, 24h store..."
              className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-500 hover:text-slate-300 text-xs px-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Category Chips */}
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => {
                soundFx.playClick();
                onSelectRoute(safeRoute);
                setSearchQuery('College Main Gate (Safe Haven)');
              }}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isSafeSelected
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShieldCheck size={14} />
              <span>SafeRoute</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onSelectRoute(shortestRoute);
                setSearchQuery('Shortest Alley Cut (High Risk)');
              }}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                !isSafeSelected
                  ? 'bg-rose-500 text-white font-bold shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Clock size={14} />
              <span>Shortest Route</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onToggleHeatmap();
              }}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isHeatmapActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Flame size={14} className={isHeatmapActive ? 'fill-current' : ''} />
              <span>{isHeatmapActive ? 'Heatmap ON' : 'Hazard Heatmap'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FLOATING GPS RECENTER & REPORT BUTTONS (Right side) */}
      <div className="absolute right-3 top-36 z-20 flex flex-col gap-2.5 pointer-events-auto">
        {/* Recenter Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onRecenter();
          }}
          title="Recenter Map on Current Location"
          className="w-12 h-12 rounded-2xl bg-[#0f172a] text-cyan-400 hover:text-white border border-slate-700 shadow-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Crosshair size={22} />
        </button>

        {/* Quick Report Button */}
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

      {/* 3. BOTTOM DESTINATION & START GPS SHEET (Google Maps style) */}
      <div className="absolute bottom-3 left-3 right-3 md:left-6 md:right-auto md:w-[460px] z-30 pointer-events-auto">
        <div className="bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-slate-700/80 text-white flex flex-col gap-3">
          {/* Destination Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  College Main Gate (Safe Haven)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  VERIFIED SAFE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Campus Entrance &bull; Security Guards 24/7 &bull; 1.1 km away
              </p>
            </div>

            <button
              onClick={() => setShowStepDetails((s) => !s)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title="Preview Steps"
            >
              {showStepDetails ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>

          {/* Route Option Cards (Side by Side or Stacked) */}
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
                Score: 94/100
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
                {shortestRoute.distanceKm} km &bull; 2 Hazards
              </div>
              <div className="mt-1.5 text-[10px] font-bold text-rose-300 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-800/60 inline-block">
                Score: 42/100
              </div>
            </div>
          </div>

          {/* Expandable Step-by-Step Preview */}
          {showStepDetails && (
            <div className="max-h-44 overflow-y-auto space-y-2 py-2 border-t border-slate-800 text-xs">
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
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BIG PROMINENT "START" GPS BUTTON (Like Google Maps green Start button) */}
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
