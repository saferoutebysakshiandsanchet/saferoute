import React, { useState } from 'react';
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
  PlusCircle, 
  Timer, 
  Gauge 
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
  // Constant average walking speed state (defaults to speedKmh or 4.8 km/h)
  const [walkingPace, setWalkingPace] = useState<number>(speedKmh || 4.8);

  const currentStep = route.waypoints[currentStepIndex] || route.waypoints[route.waypoints.length - 1];
  const nextStep = route.waypoints[currentStepIndex + 1];
  const isLastStep = currentStepIndex >= route.waypoints.length - 1;

  // Haversine geodesic distance helper between coordinates in kilometers
  const getHaversineDistanceKm = (coord1: [number, number], coord2: [number, number]): number => {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371; // Earth's mean radius in km
    const toRad = Math.PI / 180;
    const dLat = (lat2 - lat1) * toRad;
    const dLon = (lon2 - lon1) * toRad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 1. Calculate precise distance remaining based on route coordinates
  const coords = route.coordinates || [];
  const totalCoordinates = Math.max(1, coords.length);
  const isArrived = currentStepIndex >= totalCoordinates - 1;

  // Total geodesic distance across all coordinates
  let totalGeodesicKm = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    totalGeodesicKm += getHaversineDistanceKm(coords[i], coords[i + 1]);
  }

  // Geodesic distance remaining from current step coordinate to destination
  let remainingGeodesicKm = 0;
  if (!isArrived) {
    for (let i = currentStepIndex; i < coords.length - 1; i++) {
      remainingGeodesicKm += getHaversineDistanceKm(coords[i], coords[i + 1]);
    }
  }

  // Scaled remaining distance to match route.distanceKm if provided
  const distanceScale = route.distanceKm && totalGeodesicKm > 0 ? route.distanceKm / totalGeodesicKm : 1;
  const distanceRemainingKm = isArrived ? 0 : Math.max(0, remainingGeodesicKm * distanceScale);

  // 2. Constant Average Walking Speed (km/h)
  const averageWalkingSpeedKmh = walkingPace || 4.8;

  // 3. ETA Calculator: Time (Hours) = Distance Remaining (km) / Speed (km/h)
  // Time (Minutes) = Hours * 60
  const hoursRemaining = distanceRemainingKm / averageWalkingSpeedKmh;
  const exactMinutesRemaining = hoursRemaining * 60;
  const remainingMinutes = isArrived ? 0 : Math.max(1, Math.round(exactMinutesRemaining));

  // Compute Clock Arrival Time (ETA)
  const etaDate = new Date(Date.now() + exactMinutesRemaining * 60 * 1000);
  const etaString = isArrived
    ? 'Arrived'
    : etaDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Format remaining distance nicely (e.g. "850 m" or "1.1 km")
  const formattedRemainingDistance = isArrived
    ? '0 m'
    : distanceRemainingKm < 1
    ? `${Math.round(distanceRemainingKm * 1000)} m`
    : `${distanceRemainingKm.toFixed(1)} km`;

  // Choose appropriate turn icon
  const getTurnIcon = (instruction: string) => {
    const text = instruction.toLowerCase();
    if (text.includes('left')) return <CornerUpLeft size={36} className="text-white" />;
    if (text.includes('right')) return <CornerUpRight size={36} className="text-white" />;
    if (text.includes('arrive') || text.includes('safe haven')) return <MapPin size={36} className="text-white" />;
    return <ArrowUp size={36} className="text-white" />;
  };

  // Journey completed percentage calculation based on current step index vs total route coordinates
  const currentCoordinateNumber = Math.min(totalCoordinates, currentStepIndex + 1);
  const progressPercent = totalCoordinates > 1
    ? Math.min(100, Math.max(0, Math.round((currentStepIndex / (totalCoordinates - 1)) * 100)))
    : 100;

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
                <span className="text-emerald-200 font-bold">ETA {etaString} ({formattedRemainingDistance})</span>
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

          {/* Top Card Synchronized Journey Progress Line */}
          <div className="mt-3 pt-2 border-t border-emerald-500/30">
            <div className="flex items-center justify-between text-[10px] text-emerald-100 font-mono-telemetry mb-1">
              <span className="flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
                ROUTE PROGRESS
              </span>
              <span className="font-extrabold text-white text-[11px]">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-emerald-950/60 h-1.5 rounded-full overflow-hidden p-0">
              <div 
                className="bg-gradient-to-r from-emerald-200 via-teal-200 to-white h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ width: `${Math.max(2, progressPercent)}%` }}
              />
            </div>
          </div>
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
                {formattedRemainingDistance}
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

          {/* Visual Journey Progress Bar (Percentage based on current step index vs total route coordinates) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono-telemetry">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-bold">Journey Progress:</span>
                <span className="text-emerald-400 font-black text-sm tracking-tight">
                  {progressPercent}%
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Point <strong className="text-white">{currentCoordinateNumber}</strong> of <strong className="text-white">{totalCoordinates}</strong> coordinates
              </span>
            </div>

            <div className="w-full bg-slate-800/90 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/80 shadow-inner relative">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.5)] relative"
                style={{ width: `${Math.max(3, progressPercent)}%` }}
              >
                {/* Shiny leading edge highlight */}
                {progressPercent > 0 && progressPercent < 100 && (
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/80 rounded-full blur-[1px]" />
                )}
              </div>
            </div>

            {/* ETA Calculator Specs: Distance Remaining & Average Walking Speed */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5 text-xs text-slate-400 font-mono-telemetry">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Footprints size={14} className="text-cyan-400 shrink-0" />
                  <span>Walking Speed:</span>
                  <strong className="text-white">{averageWalkingSpeedKmh} km/h</strong>
                  <span className="text-[10px] text-slate-500 font-normal">(Constant Avg)</span>
                </span>

                <span className="text-emerald-400 font-bold">
                  Safety: {route.safetyScore}/100
                </span>
              </div>

              {/* Speed Pace Presets & Calculation Breakdown */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                  <Timer size={12} className="text-emerald-400 shrink-0" />
                  <span>ETA = {formattedRemainingDistance} &divide; {averageWalkingSpeedKmh} km/h</span>
                </span>

                <div className="flex items-center gap-1">
                  {[
                    { label: 'Casual', speed: 4.0 },
                    { label: 'Avg', speed: 4.8 },
                    { label: 'Brisk', speed: 5.4 },
                  ].map((pace) => (
                    <button
                      key={pace.label}
                      onClick={() => {
                        soundFx.playClick();
                        setWalkingPace(pace.speed);
                      }}
                      title={`Set constant walking speed to ${pace.speed} km/h`}
                      className={`px-1.5 py-0.5 rounded text-[10px] border transition-all cursor-pointer ${
                        walkingPace === pace.speed
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-slate-200'
                      }`}
                    >
                      {pace.label} ({pace.speed})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
