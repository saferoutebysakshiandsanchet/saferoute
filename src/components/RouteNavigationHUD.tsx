import React, { useState } from 'react';
import { 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  Eye, 
  Lightbulb, 
  Clock, 
  MapPin, 
  Search, 
  ArrowRight, 
  Play, 
  Square, 
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { SafeRouteOption, Waypoint } from '../types/sentinel';
import { soundFx } from '../utils/sound';

interface RouteNavigationHUDProps {
  safeRoute: SafeRouteOption;
  directRoute: SafeRouteOption;
  activeRoute: SafeRouteOption | null;
  isNavigating: boolean;
  currentStepIndex: number;
  onSelectRoute: (route: SafeRouteOption) => void;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  onSimulateWalkToggle: () => void;
  isSimulatingWalk: boolean;
}

export const RouteNavigationHUD: React.FC<RouteNavigationHUDProps> = ({
  safeRoute,
  directRoute,
  activeRoute,
  isNavigating,
  currentStepIndex,
  onSelectRoute,
  onStartNavigation,
  onStopNavigation,
  onSimulateWalkToggle,
  isSimulatingWalk,
}) => {
  const [searchQuery, setSearchQuery] = useState('820 Mission Blvd (Walgreens 24H)');
  const [isExpanded, setIsExpanded] = useState(false);

  const currentStep: Waypoint | undefined = activeRoute?.steps[currentStepIndex];

  return (
    <div className="w-full">
      {/* If actively navigating, show the Turn-by-Turn HUD */}
      {isNavigating && activeRoute ? (
        <div className="tactical-glass-2 rounded-xl p-4 shadow-2xl border border-amber-500/30 animate-in fade-in duration-200">
          {/* Top telemetry bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 font-mono-telemetry text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-safe-pulse" />
              <span className="text-amber-400 font-bold uppercase tracking-wider">
                SENTINEL SHIELD ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-amber-400" />
                <strong className="text-white">{activeRoute.etaMinutes} MIN</strong>
              </span>
              <span>{activeRoute.distanceKm} KM</span>
            </div>
          </div>

          {/* Current Turn Instruction */}
          <div className="mt-3 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg">
              <Navigation size={22} className="rotate-45" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-mono-telemetry text-slate-400 uppercase tracking-wider">
                STEP {currentStepIndex + 1} OF {activeRoute.steps.length}
              </div>
              <h2 className="text-sm md:text-base font-bold text-white leading-snug">
                {currentStep ? currentStep.instruction : 'Arriving at Safe Destination'}
              </h2>
              {currentStep?.hasSafeHavenNearby && (
                <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono-telemetry bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
                  <ShieldCheck size={11} />
                  <span>Safe Haven Node Nearby: {currentStep.hasSafeHavenNearby}</span>
                </div>
              )}
            </div>
          </div>

          {/* Environmental Telemetry Meter */}
          <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-700/60 font-mono-telemetry text-xs">
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Lightbulb size={13} className="text-amber-400" />
                Illumination:
              </span>
              <span className="text-amber-300 font-bold">
                {currentStep?.lightingScore || activeRoute.lightingRating}% OPTIMAL
              </span>
            </div>

            <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Eye size={13} className="text-indigo-400" />
                CCTV Coverage:
              </span>
              <span className="text-indigo-300 font-bold">
                {activeRoute.cctvCoverageCount} CAMERAS
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onSimulateWalkToggle();
              }}
              className={`flex-1 py-2.5 px-3 rounded text-xs font-mono-telemetry font-bold tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                isSimulatingWalk
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-inner'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
              }`}
            >
              <Play size={13} className={isSimulatingWalk ? 'fill-current animate-pulse' : ''} />
              <span>{isSimulatingWalk ? 'SIMULATING TRANSIT...' : 'SIMULATE WALK'}</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onStopNavigation();
              }}
              className="py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700 text-rose-300 border border-slate-700/80 rounded text-xs font-mono-telemetry font-bold tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Square size={13} />
              <span>STOP</span>
            </button>
          </div>
        </div>
      ) : (
        /* Pre-navigation Route Selection HUD */
        <div className="tactical-glass-1 rounded-xl p-4 shadow-2xl border border-slate-700/60">
          {/* Destination Search Bar */}
          <div className="relative">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search safe destination, station, 24h store..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#0f172a] text-[#f8fafc] text-sm rounded-md border border-[#334155] focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/40 font-mono-telemetry placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Quick preset destination tags */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono-telemetry no-scrollbar">
            <span className="text-slate-400 shrink-0">QUICK:</span>
            <button
              onClick={() => {
                soundFx.playClick();
                setSearchQuery('Walgreens 24H Pharmacy & Safe Point');
                onSelectRoute(safeRoute);
              }}
              className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 shrink-0"
            >
              Walgreens 24H
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setSearchQuery('Metro Center Transit Concourse');
                onSelectRoute(safeRoute);
              }}
              className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/80 shrink-0"
            >
              Metro Concourse
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setSearchQuery('District 4 Police Substation');
                onSelectRoute(safeRoute);
              }}
              className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-indigo-300 border border-slate-700/80 shrink-0"
            >
              Police Post
            </button>
          </div>

          {/* Route Options Comparison Cards */}
          <div className="mt-3 space-y-2">
            {/* Sentinel Safe Route (Amber Glow) */}
            <div
              onClick={() => {
                soundFx.playClick();
                onSelectRoute(safeRoute);
              }}
              className={`p-3 rounded-lg cursor-pointer border transition-all ${
                activeRoute?.id === 'safe'
                  ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-slate-950">
                    <ShieldCheck size={13} />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide">
                    SENTINEL SAFE ROUTE
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-telemetry bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    RECOMMENDED
                  </span>
                </div>
                <span className="text-sm font-bold text-amber-400 font-mono-telemetry">
                  {safeRoute.etaMinutes} min ({safeRoute.distanceKm} km)
                </span>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-1 font-mono-telemetry text-[11px] text-slate-300">
                <span className="flex items-center gap-1 text-amber-300">
                  <Lightbulb size={11} /> {safeRoute.lightingRating}% Lumen
                </span>
                <span className="flex items-center gap-1 text-indigo-300">
                  <Eye size={11} /> {safeRoute.cctvCoverageCount} CCTV
                </span>
                <span className="flex items-center gap-1 text-cyan-300">
                  <ShieldCheck size={11} /> {safeRoute.safeHavenCount} Havens
                </span>
              </div>
            </div>

            {/* Direct Unshielded Route (Caution) */}
            <div
              onClick={() => {
                soundFx.playClick();
                onSelectRoute(directRoute);
              }}
              className={`p-2.5 rounded-lg cursor-pointer border transition-all ${
                activeRoute?.id === 'direct'
                  ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-400" />
                  <span className="text-xs font-medium text-slate-300">
                    Direct Dark Alley Shortcut
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-telemetry bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    HIGH RISK
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono-telemetry">
                  {directRoute.etaMinutes} min
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Button (Start Safe Route) */}
          <div className="mt-3">
            <button
              onClick={() => {
                soundFx.playClick();
                onStartNavigation();
              }}
              className="w-full py-3 px-4 bg-[#f59e0b] hover:bg-[#d97706] active:bg-[#b45309] text-[#0b0f17] font-extrabold text-sm uppercase tracking-wider rounded-md transition-all shadow-[0_4px_16px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Navigation size={16} className="fill-current group-hover:scale-110 transition-transform" />
              <span>START SAFE ROUTE</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
