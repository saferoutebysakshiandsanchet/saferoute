import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ThumbsUp, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Cpu, 
  Radio, 
  Navigation,
  Compass 
} from 'lucide-react';
import { HazardDoc } from '../types/saferoute';
import { soundFx } from '../utils/sound';

interface HazardDetailCardProps {
  hazard: HazardDoc;
  onClose: () => void;
  onUpvote: (hazardId: string) => void;
  userPosition: [number, number]; // [lat, lng]
  onAvoidInRoute?: (hazard: HazardDoc) => void;
}

export const HazardDetailCard: React.FC<HazardDetailCardProps> = ({
  hazard,
  onClose,
  onUpvote,
  userPosition,
  onAvoidInRoute,
}) => {
  const [hasUpvoted, setHasUpvoted] = useState(false);

  // Calculate distance in meters using spherical Haversine formula
  const [lng, lat] = hazard.location.coordinates;
  const [userLat, userLng] = userPosition;

  const R = 6371e3; // Earth radius in meters
  const phi1 = (userLat * Math.PI) / 180;
  const phi2 = (lat * Math.PI) / 180;
  const deltaPhi = ((lat - userLat) * Math.PI) / 180;
  const deltaLambda = ((lng - userLng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceMeters = Math.round(R * c);

  const handleUpvoteClick = () => {
    if (!hasUpvoted) {
      soundFx.playClick();
      setHasUpvoted(true);
      onUpvote(hazard.hazardId);
    }
  };

  return (
    <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-30 pointer-events-auto">
      <div className="tactical-glass-1 rounded-xl p-4 shadow-2xl border border-slate-700/80 relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono-telemetry font-bold ${
              hazard.severity === 'High'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
            }`}>
              {hazard.severity} SEVERITY
            </span>

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono-telemetry font-bold ${
              hazard.status === 'Verified'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {hazard.status === 'Verified' ? '✓ VERIFIED ON PUBLIC MAP' : '⏱ PENDING MODERATION'}
            </span>

            {hazard.source === 'IoT' && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono-telemetry bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                ESP32 IoT
              </span>
            )}
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hazard Title & Address */}
        <div className="mt-3">
          <h3 className="text-base font-bold text-white leading-tight">
            {hazard.type}
          </h3>
          <p className="mt-1 text-xs text-slate-400 flex items-center gap-1 font-mono-telemetry">
            <MapPin size={12} className="text-cyan-400 shrink-0" />
            <span className="truncate">{hazard.address}</span>
            <span className="text-cyan-300 font-bold">({distanceMeters}m away)</span>
          </p>
        </div>

        {/* Description */}
        <p className="mt-2 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          {hazard.description}
        </p>

        {/* Telemetry info */}
        <div className="mt-2.5 py-2 border-y border-slate-700/60 grid grid-cols-2 gap-2 text-[11px] font-mono-telemetry text-slate-300">
          <div>
            <span className="text-slate-500">Source: </span>
            <span className="text-indigo-300 font-bold">{hazard.source === 'IoT' ? 'ESP32 Sensor' : hazard.userName || 'Citizen'}</span>
          </div>
          <div>
            <span className="text-slate-500">Geo Coordinates: </span>
            <span className="text-cyan-300 font-bold">[{lng.toFixed(4)}, {lat.toFixed(4)}]</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={handleUpvoteClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-telemetry font-bold flex items-center gap-1.5 border transition-all ${
              hasUpvoted
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <ThumbsUp size={13} />
            <span>CONFIRM / UPVOTE ({hazard.upvotes})</span>
          </button>

          {onAvoidInRoute && (
            <button
              onClick={() => onAvoidInRoute(hazard)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-mono-telemetry rounded-lg transition-colors flex items-center gap-1"
            >
              <Navigation size={13} />
              <span>AVOID IN ROUTE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
