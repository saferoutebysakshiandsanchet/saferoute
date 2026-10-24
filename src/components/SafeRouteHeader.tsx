import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  AlertTriangle, 
  BookOpen, 
  PlusCircle, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon,
  Lock,
  Flame
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface SafeRouteHeaderProps {
  onOpenPinHazard: () => void;
  onOpenReportSummary: () => void;
  onOpenAdminLogin: () => void;
  tileTheme: 'streets' | 'dark' | 'satellite';
  onToggleTileTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  pendingCount: number;
}

export const SafeRouteHeader: React.FC<SafeRouteHeaderProps> = ({
  onOpenPinHazard,
  onOpenReportSummary,
  onOpenAdminLogin,
  tileTheme,
  onToggleTileTheme,
  isMuted,
  onToggleMute,
  pendingCount,
}) => {
  return (
    <header className="h-16 px-4 bg-[#0a0e16]/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0 z-40 select-none">
      {/* Brand & Customer Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]">
          <ShieldCheck size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-white uppercase font-sans">
              SafeRoute
            </h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              CITIZEN APP
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Safety Navigation &bull; Live Hazard Layer &bull; Free & Open-Source
          </p>
        </div>
      </div>

      {/* Right Customer Action Tools & Admin Portal Link */}
      <div className="flex items-center gap-2">
        {/* Project Report Modal */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenReportSummary();
          }}
          title="SafeRoute Project Report (Chapters 1–4)"
          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono-telemetry font-bold flex items-center gap-1.5 transition-colors hidden md:flex cursor-pointer"
        >
          <BookOpen size={14} className="text-indigo-400" />
          <span>REPORT (CH 1–4)</span>
        </button>

        {/* Pin Hazard on map */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenPinHazard();
          }}
          className="px-3.5 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-[#0b0f17] font-bold text-xs font-mono-telemetry tracking-wide rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle size={15} />
          <span className="hidden xs:inline">REPORT HAZARD</span>
          <span className="xs:hidden">REPORT</span>
        </button>

        {/* Tile theme toggle (Day vs Night) */}
        <button
          onClick={onToggleTileTheme}
          title={`Map Theme: ${tileTheme}`}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {tileTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Audio mute toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Discreet Admin Device Link (Only for authorized admin access) */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenAdminLogin();
          }}
          title="Switch to Municipal Admin Terminal Device"
          className="px-2.5 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 text-xs font-mono-telemetry font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer ml-1"
        >
          <Lock size={13} className="text-indigo-400" />
          <span className="hidden sm:inline">ADMIN DEVICE</span>
          {pendingCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
