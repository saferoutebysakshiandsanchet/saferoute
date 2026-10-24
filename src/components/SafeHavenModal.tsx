import React from 'react';
import { 
  X, 
  Shield, 
  Phone, 
  Clock, 
  Video, 
  Users, 
  MapPin, 
  Navigation 
} from 'lucide-react';
import { SafeHaven } from '../types/sentinel';
import { soundFx } from '../utils/sound';

interface SafeHavenModalProps {
  haven: SafeHaven;
  onClose: () => void;
  onRouteToHaven: (haven: SafeHaven) => void;
}

export const SafeHavenModal: React.FC<SafeHavenModalProps> = ({
  haven,
  onClose,
  onRouteToHaven,
}) => {
  return (
    <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-30 pointer-events-auto">
      <div className="tactical-glass-1 rounded-lg p-4 shadow-2xl border border-cyan-500/40 relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono-telemetry font-semibold uppercase bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping-slow" />
            <Shield size={12} />
            <span>VERIFIED SAFE-HAVEN HUB</span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-700/40 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Haven Name & Address */}
        <div className="mt-3">
          <h3 className="text-base font-bold text-[#f8fafc] leading-tight flex items-center gap-2">
            {haven.name}
          </h3>
          <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5 font-mono-telemetry">
            <MapPin size={12} className="text-cyan-400 shrink-0" />
            <span>{haven.address}</span>
            <span className="text-cyan-300 font-semibold">({haven.distanceMeters}m away)</span>
          </p>
        </div>

        {/* Feature badges */}
        <div className="mt-3 py-2 border-y border-slate-700/40 grid grid-cols-2 gap-2 text-[11px] font-mono-telemetry text-slate-300">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-emerald-400 shrink-0" />
            <span className="text-slate-400">Hours:</span>
            <span className="text-white font-medium">{haven.hours}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-teal-400 shrink-0" />
            <span className="text-slate-400">Security:</span>
            <span className="text-teal-300 font-semibold">{haven.staffPresent ? 'Staff On-Site' : 'Automated Intercom'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Video size={12} className="text-indigo-400 shrink-0" />
            <span className="text-slate-400">Municipal CCTV:</span>
            <span className="text-indigo-300 font-semibold">{haven.cctvInstalled ? 'Active Feed' : 'None'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Phone size={12} className="text-amber-400 shrink-0" />
            <span className="text-slate-400">Direct Line:</span>
            <span className="text-amber-300 font-semibold">{haven.phone}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              onRouteToHaven(haven);
            }}
            className="w-full py-2.5 px-3 bg-[#f59e0b] hover:bg-[#d97706] active:bg-[#b45309] text-[#0b0f17] font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Navigation size={14} className="fill-current" />
            <span>SET AS SAFE ROUTE DESTINATION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
