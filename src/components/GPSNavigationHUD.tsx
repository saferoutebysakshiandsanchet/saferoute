import React from 'react';
import { 
  Navigation, 
  ArrowUp, 
  ArrowLeft, 
  ArrowRight, 
  CornerUpRight, 
  CornerUpLeft, 
  Volume2, 
  VolumeX, 
  X, 
  Compass, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Crosshair, 
  Footprints,
  Flame,
  PlusCircle
} from 'lucide-react';
import { SafeRoutePlan } from '../types/saferoute';
import { soundFx } from '../utils/sound';

interface GPSNavigationHUDProps {
  route: SafeRoutePlan;
  currentStepIndex: number;
  onExitNavigation: () => void;
  onRecenterGPS: () => void;
  onOpenReport: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  speedKmh?: number;
}

export const GPSNavigationHUD: React.FC<GPSNavigationHUDProps> = ({
  route,
  currentStepIndex,
  onExitNavigation,
  onRecenterGPS,
  onOpenReport,
  voiceEnabled,
  onToggleVoice,
  speedKmh = 4.8,
}) => {
  const currentStep = route.waypoints[currentStepIndex] || route.waypoints[route.waypoints.length - 1];
  const nextStep = route.waypoints[currentStepIndex + 1];
  const isLastStep = currentStepIndex >= route.waypoints.length - 1;

  // Choose appropriate turn icon
  const getTurnIcon = (instruction: string) => {
    const text = instruction.toLowerCase();
    if (text.includes('left')) return <CornerUpLeft size={36} className="text-white" />;
    if (text.includes('right')) return <CornerUpRight size={36} className="text-white" />;
    if (text.includes('arrive') || text.includes('safe haven')) return <MapPin size={36} className="text-white" />;
    return <ArrowUp size={36} className="text-white" />;
  };

  // Remaining calculation estimates
  const remainingSteps = Math.max(1, route.waypoints.length - currentStepIndex);
  const remainingMinutes = Math.max(1, Math.round((route.durationMinutes * remainingSteps) / route.waypoints.length));
  const remainingKm = Math.max(0.1, ((route.distanceKm * remainingSteps) / route.waypoints.length)).toFixed(1);

  // Compute ETA clock time (e.g. 7:42 PM)
  const etaDate = new Date(Date.now() + remainingMinutes * 60000);
  const etaString = etaDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <>
      {/* 1. TOP GPS TURN GUIDANCE CARD (Like Google Maps driving/walking mode) */}
      <div className="absolute top-3 left-3 right-3 md:left-6 md:right-auto md:w-[440px] z-30 pointer-events-auto">
        <div className="bg-[#059669] text-white rounded-2xl shadow-2xl p-4 border border-emerald-400/30 overflow-hidden relative transition-all">
          {/* Subtle green gradient pulse */}
          <div className="flex items-start justify-between gap-3">
            {/* Big Direction Icon */}
            <div className="w-14 h-14 rounded-2xl bg-emerald-800/80 flex items-center justify-center shrink-0 shadow-inner border border-emerald-400/40">
              {getTurnIcon(currentStep.instruction)}
            </div>

            {/* Instruction Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-100 text-[11px] font-bold uppercase tracking-wider">
                <span>IN {isLastStep ? '50 METERS' : `${120 + currentStepIndex * 40} METERS`}</span>
                <span className="text-emerald-300">&bull;</span>
                <span className="text-emerald-200">SAFETY SHIELD ACTIVE</span>
              </div>

              <h2 className="text-base sm:text-lg font-black leading-tight text-white mt-0.5 truncate">
                {currentStep.instruction}
              </h2>

              <p className="text-xs text-emerald-100 font-medium truncate mt-0.5">
                {currentStep.street}
              </p>
            </div>

            {/* Voice Guidance Speaker Toggle */}
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleVoice();
              }}
              title={voiceEnabled ? 'Mute GPS Voice' : 'Unmute GPS Voice'}
              className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-400/30 transition-colors shrink-0"
            >
              {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          {/* Safety Highlight or Hazard Warning Pill */}
          {currentStep.safeNote && (
            <div className="mt-2.5 pt-2 border-t border-emerald-500/40 flex items-center gap-2 text-xs text-emerald-100 font-medium">
              <ShieldCheck size={14} className="text-amber-300 shrink-0" />
              <span className="truncate">{currentStep.safeNote}</span>
            </div>
          )}

          {currentStep.hazardWarning && (
            <div className="mt-2.5 pt-2 border-t border-emerald-500/40 flex items-center gap-2 text-xs text-amber-200 font-bold bg-amber-950/40 p-1.5 rounded-lg">
              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
              <span className="truncate">{currentStep.hazardWarning}</span>
            </div>
          )}

          {/* Next Maneuver Preview */}
          {nextStep && !isLastStep && (
            <div className="mt-2 text-[11px] text-emerald-200/90 flex items-center gap-1">
              <span className="text-emerald-300">Then:</span>
              <span className="truncate">{nextStep.instruction}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. FLOATING GPS TOOLS (Right side) */}
      <div className="absolute right-3 top-48 z-20 flex flex-col gap-2.5 pointer-events-auto">
        {/* Recenter Follow Puck Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onRecenterGPS();
          }}
          title="Recenter GPS on current location"
          className="w-12 h-12 rounded-2xl bg-[#0f172a] text-cyan-400 hover:text-white border border-slate-700 shadow-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Crosshair size={22} className="animate-spin-slow" />
        </button>

        {/* Quick Hazard Report Button (Waze / Google Maps style) */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenReport();
          }}
          title="Quick Report a Hazard at Current Location"
          className="w-12 h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black border border-amber-300 shadow-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <AlertTriangle size={22} className="fill-current" />
        </button>
      </div>

      {/* 3. BOTTOM GPS TRIP HUD BAR (Google Maps style bottom panel) */}
      <div className="absolute bottom-3 left-3 right-3 md:left-6 md:right-auto md:w-[440px] z-30 pointer-events-auto">
        <div className="bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-slate-700 text-white flex flex-col gap-3">
          {/* Main Big Numbers */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400 tracking-tight">
                {remainingMinutes}
              </span>
              <span className="text-sm font-bold text-emerald-400 uppercase">
                MIN
              </span>
              <span className="text-slate-500 font-bold mx-1">&bull;</span>
              <span className="text-sm font-bold text-slate-300">
                {remainingKm} km
              </span>
              <span className="text-slate-500 font-bold mx-1">&bull;</span>
              <span className="text-sm font-semibold text-slate-400">
                ETA {etaString}
              </span>
            </div>

            {/* Exit Red X Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onExitNavigation();
              }}
              title="Exit Navigation"
              className="w-10 h-10 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 hover:text-white border border-rose-500/40 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar & Walking Speed */}
          <div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, ((currentStepIndex + 1) / route.waypoints.length) * 100)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-400 font-mono-telemetry">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Footprints size={14} className="text-cyan-400" />
                Walking Speed: <strong className="text-white">{speedKmh} km/h</strong>
              </span>

              <span className="text-emerald-400 font-bold">
                Safety Score: {route.safetyScore}/100
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
