import React from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Layers, 
  PlusCircle, 
  Radio, 
  Smartphone, 
  Monitor, 
  Flame 
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface HeaderNavProps {
  onOpenReport: () => void;
  onOpenAudit: () => void;
  onTriggerSOS: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  activeViewMode: 'mobile' | 'patrol';
  onSetViewMode: (mode: 'mobile' | 'patrol') => void;
  emergencyActive: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenReport,
  onOpenAudit,
  onTriggerSOS,
  isMuted,
  onToggleMute,
  activeViewMode,
  onSetViewMode,
  emergencyActive,
}) => {
  return (
    <header className="h-16 px-4 bg-[#0a0e16]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between shrink-0 z-40 select-none">
      {/* Brand & Sentinel Status */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
          <ShieldAlert size={20} className="fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-extrabold tracking-tight text-white uppercase font-sans">
              MIDNIGHT SENTINEL
            </h1>
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono-telemetry bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-semibold">
              CIVIC DEFENSE v2.4
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono-telemetry text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">NIGHT PATROL GRID ENGAGED</span>
          </div>
        </div>
      </div>

      {/* Center Device Mode Switcher (Tablet/Desktop vs Mobile View) */}
      <div className="hidden md:flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono-telemetry">
        <button
          onClick={() => {
            soundFx.playClick();
            onSetViewMode('mobile');
          }}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
            activeViewMode === 'mobile'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone size={13} />
          <span>Mobile Device HUD</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onSetViewMode('patrol');
          }}
          className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
            activeViewMode === 'patrol'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Monitor size={13} />
          <span>Patrol Command Center</span>
        </button>
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center gap-2">
        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
          className="p-2 rounded-md tactical-glass-1 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-colors"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Telemetry Audit Drawer Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenAudit();
          }}
          title="Open Telemetry Operations Drawer"
          className="px-2.5 py-1.5 rounded-md tactical-glass-1 text-xs font-mono-telemetry text-slate-300 hover:text-cyan-300 border border-slate-700/80 flex items-center gap-1.5 transition-colors hidden sm:flex"
        >
          <Radio size={14} className="text-cyan-400" />
          <span>TELEMETRY</span>
        </button>

        {/* Report Hazard Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenReport();
          }}
          className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 text-xs font-mono-telemetry font-semibold flex items-center gap-1.5 transition-all shadow cursor-pointer"
        >
          <PlusCircle size={14} />
          <span className="hidden xs:inline">REPORT HAZARD</span>
          <span className="xs:hidden">REPORT</span>
        </button>

        {/* Emergency SOS Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onTriggerSOS();
          }}
          className={`relative px-3.5 py-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-extrabold text-xs tracking-wider rounded-md transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-1.5 cursor-pointer ${
            emergencyActive ? 'animate-bounce' : 'animate-sos-pulse'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>SOS BEACON</span>
        </button>
      </div>
    </header>
  );
};
