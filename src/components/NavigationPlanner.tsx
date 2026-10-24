import React, { useState } from 'react';
import { 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Play, 
  Square, 
  ArrowRight, 
  Lightbulb, 
  Dog, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { SafeRoutePlan } from '../types/saferoute';
import { soundFx } from '../utils/sound';

interface NavigationPlannerProps {
  safeRoute: SafeRoutePlan;
  shortestRoute: SafeRoutePlan;
  activeRoute: SafeRoutePlan | null;
  onSelectRoute: (route: SafeRoutePlan) => void;
  isNavigating: boolean;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  currentStepIndex: number;
}

export const NavigationPlanner: React.FC<NavigationPlannerProps> = ({
  safeRoute,
  shortestRoute,
  activeRoute,
  onSelectRoute,
  isNavigating,
  onStartNavigation,
  onStopNavigation,
  currentStepIndex,
}) => {
  const [origin, setOrigin] = useState('Deccan Gymkhana Crossing');
  const [destination, setDestination] = useState('College Main Gate (Safe Haven)');

  return (
    <div className="w-full">
      {isNavigating && activeRoute ? (
        /* Actively Navigating HUD */
        <div className="tactical-glass-2 rounded-xl p-4 shadow-2xl border border-emerald-500/40 animate-in fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-700 font-mono-telemetry text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold uppercase tracking-wider">
                SAFE-ROUTE GUIDANCE ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <span>{activeRoute.durationMinutes} MIN</span>
              <span>{activeRoute.distanceKm} KM</span>
            </div>
          </div>

          {/* Current Turn Step */}
          <div className="mt-3 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow">
              <Navigation size={20} className="rotate-45" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-mono-telemetry text-slate-400 uppercase">
                STEP {currentStepIndex + 1} OF {activeRoute.waypoints.length}
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">
                {activeRoute.waypoints[currentStepIndex]?.instruction || 'Arriving at Destination'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeRoute.waypoints[currentStepIndex]?.street}
              </p>
              {activeRoute.waypoints[currentStepIndex]?.safeNote && (
                <div className="mt-1.5 p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono-telemetry flex items-center gap-1.5">
                  <ShieldCheck size={13} className="shrink-0 text-emerald-400" />
                  <span>{activeRoute.waypoints[currentStepIndex]?.safeNote}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stop / Cancel */}
          <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
            <span className="text-xs font-mono-telemetry text-emerald-400 font-bold">
              Safety Score: {activeRoute.safetyScore}/100
            </span>
            <button
              onClick={() => {
                soundFx.playClick();
                onStopNavigation();
              }}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 rounded text-xs font-mono-telemetry font-bold flex items-center gap-1.5"
            >
              <Square size={13} />
              <span>STOP GUIDANCE</span>
            </button>
          </div>
        </div>
      ) : (
        /* Pre-navigation Route Selection & Search Card */
        <div className="tactical-glass-1 rounded-xl p-4 shadow-2xl border border-slate-700/80">
          {/* Origin & Destination inputs */}
          <div className="space-y-2 text-xs font-mono-telemetry">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Current Location / Origin..."
                className="w-full bg-transparent text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination address or landmark..."
                className="w-full bg-transparent text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Route Comparison Cards */}
          <div className="mt-3 space-y-2">
            {/* SafeRoute Option */}
            <div
              onClick={() => {
                soundFx.playClick();
                onSelectRoute(safeRoute);
              }}
              className={`p-3 rounded-lg cursor-pointer border transition-all ${
                activeRoute?.id === 'safe'
                  ? 'bg-emerald-500/15 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide">
                    SafeRoute Shield Path
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-telemetry bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    SAFETY SCORE: 94/100
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono-telemetry">
                  {safeRoute.durationMinutes} min ({safeRoute.distanceKm} km)
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-300">
                {safeRoute.tagline}
              </p>
            </div>

            {/* Shortest Route (Warning) */}
            <div
              onClick={() => {
                soundFx.playClick();
                onSelectRoute(shortestRoute);
              }}
              className={`p-2.5 rounded-lg cursor-pointer border transition-all ${
                activeRoute?.id === 'shortest'
                  ? 'bg-rose-500/15 border-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-400" />
                  <span className="text-xs font-medium text-slate-300">
                    Shortest Raw Route
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-telemetry bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                    SCORE: 42/100 (HIGH RISK)
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono-telemetry">
                  {shortestRoute.durationMinutes} min
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="mt-3">
            <button
              onClick={() => {
                soundFx.playClick();
                onStartNavigation();
              }}
              className="w-full py-2.5 px-4 bg-[#f59e0b] hover:bg-[#d97706] text-[#0b0f17] font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation size={15} className="fill-current" />
              <span>START SAFE NAVIGATION</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
