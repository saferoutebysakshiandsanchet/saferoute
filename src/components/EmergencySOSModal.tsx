import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  X, 
  Volume2, 
  VolumeX, 
  Sun, 
  Radio, 
  PhoneCall, 
  Users, 
  ShieldCheck, 
  CheckCircle, 
  Compass, 
  Navigation
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoordinates: { lat: number; lng: number };
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  userCoordinates,
}) => {
  const [countdown, setCountdown] = useState<number | null>(5);
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [isSirenPlaying, setIsSirenPlaying] = useState(true);
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [strobeState, setStrobeState] = useState(false);

  // 5-second countdown timer
  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setIsBeaconActive(false);
      soundFx.stopSiren();
      return;
    }

    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        soundFx.playRadarBlip();
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Activate beacon!
      setIsBeaconActive(true);
      setCountdown(null);
      if (isSirenPlaying) {
        soundFx.startSiren();
      }
    }
  }, [isOpen, countdown, isSirenPlaying]);

  // Flashlight strobe effect
  useEffect(() => {
    if (!isStrobeActive) {
      setStrobeState(false);
      return;
    }
    const interval = setInterval(() => {
      setStrobeState((s) => !s);
    }, 150);
    return () => clearInterval(interval);
  }, [isStrobeActive]);

  const handleInstantActivate = () => {
    soundFx.playClick();
    setCountdown(null);
    setIsBeaconActive(true);
    if (isSirenPlaying) {
      soundFx.startSiren();
    }
  };

  const handleCancelCountdown = () => {
    soundFx.playClick();
    soundFx.stopSiren();
    onClose();
  };

  const handleToggleSiren = () => {
    soundFx.playClick();
    if (isSirenPlaying) {
      soundFx.stopSiren();
      setIsSirenPlaying(false);
    } else {
      soundFx.startSiren();
      setIsSirenPlaying(true);
    }
  };

  const handleDeactivate = () => {
    soundFx.playClick();
    soundFx.stopSiren();
    setIsBeaconActive(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      {/* Strobe background overlay if enabled */}
      {isStrobeActive && (
        <div 
          className={`absolute inset-0 pointer-events-none transition-opacity duration-75 ${
            strobeState ? 'bg-white opacity-95' : 'bg-transparent opacity-0'
          }`} 
        />
      )}

      {/* Main Alert Card */}
      <div 
        className="w-full max-w-md tactical-hud-alert bg-[#111827] border-2 border-red-500 rounded-2xl p-6 relative shadow-2xl overflow-hidden"
        style={{
          boxShadow: '0 0 35px 4px rgba(239, 68, 68, 0.45)',
        }}
      >
        {/* Pulsing red beacon halo */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-red-600/20 blur-2xl animate-pulse pointer-events-none" />

        {/* State 1: Countdown Confirmation */}
        {countdown !== null ? (
          <div className="text-center py-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-500 animate-sos-pulse">
              <span className="text-4xl font-extrabold font-mono-telemetry">{countdown}</span>
            </div>

            <h2 className="mt-4 text-xl font-extrabold text-white uppercase tracking-wider">
              EMERGENCY SOS BEACON INITIATING
            </h2>

            <p className="mt-2 text-xs text-slate-300 max-w-xs mx-auto">
              Broadcasting GPS coordinates to municipal safety dispatch and alerting 3 emergency contacts in {countdown} seconds.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={handleInstantActivate}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm uppercase tracking-wider rounded-lg transition-all shadow-lg active:scale-95"
              >
                ACTIVATE NOW (SKIP COUNTDOWN)
              </button>

              <button
                onClick={handleCancelCountdown}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors border border-slate-700"
              >
                CANCEL (I AM SAFE)
              </button>
            </div>
          </div>
        ) : (
          /* State 2: Active Emergency Beacon Broadcast */
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-red-500/40">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-400 font-bold font-mono-telemetry text-sm tracking-wider">
                  DISPATCH BEACON ACTIVE
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-telemetry bg-red-500/20 text-red-300 border border-red-500/50">
                HIGH PRIORITY
              </span>
            </div>

            {/* Coordinates & Dispatch Telemetry */}
            <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-800/60 font-mono-telemetry text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">GEO COORDINATES:</span>
                <span className="text-white font-bold">{userCoordinates.lat.toFixed(4)}°N, {userCoordinates.lng.toFixed(4)}°W</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">DISPATCH UNIT:</span>
                <span className="text-teal-300 font-bold">Civic Patrol #12 (En Route)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">ESTIMATED ARRIVAL:</span>
                <span className="text-amber-400 font-bold">~2 MIN 40 SEC</span>
              </div>
            </div>

            {/* Contact Notifications */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-400 font-mono-telemetry uppercase tracking-wider mb-2">
                AUTOMATED ESCORT NOTIFICATIONS
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-200">Municipal 911 / Police Relay</span>
                  <span className="text-emerald-400 font-mono-telemetry flex items-center gap-1 font-semibold">
                    <CheckCircle size={12} /> ACKNOWLEDGED
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-200">Emergency Contact (Mom)</span>
                  <span className="text-emerald-400 font-mono-telemetry flex items-center gap-1 font-semibold">
                    <CheckCircle size={12} /> SMS PING SENT
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-200">Campus Escort Post</span>
                  <span className="text-cyan-400 font-mono-telemetry flex items-center gap-1 font-semibold">
                    <Radio size={12} /> MONITORING
                  </span>
                </div>
              </div>
            </div>

            {/* Tactical Deterrent Controls (Strobe & Siren) */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={handleToggleSiren}
                className={`p-2.5 rounded-lg border font-mono-telemetry text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  isSirenPlaying
                    ? 'bg-red-500/20 text-red-300 border-red-500/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isSirenPlaying ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>{isSirenPlaying ? 'SIREN ON' : 'SIREN OFF'}</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsStrobeActive((s) => !s);
                }}
                className={`p-2.5 rounded-lg border font-mono-telemetry text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  isStrobeActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Sun size={14} />
                <span>{isStrobeActive ? 'STROBE ON' : 'STROBE LIGHT'}</span>
              </button>
            </div>

            {/* Stand Down / Safe Button */}
            <div className="mt-5">
              <button
                onClick={handleDeactivate}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm uppercase tracking-wider rounded-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                <span>STAND DOWN (I AM SECURE)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
