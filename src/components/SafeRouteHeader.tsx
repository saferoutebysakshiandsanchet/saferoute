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
  Flame,
  HardDrive,
  WifiOff,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Bot,
  LogIn,
  LogOut,
  User,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../utils/sound';
import { PWAInstallButton } from './PWAInstallButton';
import { useAuth } from '../context/AuthContext';

interface SafeRouteHeaderProps {
  onOpenPinHazard: () => void;
  onOpenReportSummary: () => void;
  onOpenAdminLogin: () => void;
  onOpenChatbot: () => void;
  tileTheme: 'streets' | 'dark' | 'satellite';
  onToggleTileTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  pendingCount: number;
  onOpenOfflineMaps: () => void;
  isSimulatedOffline: boolean;
  cachedTilesCount: number;
  locationPermission: 'granted' | 'prompt' | 'denied' | 'unknown';
  onRequestLocationRights: () => void;
}

export const SafeRouteHeader: React.FC<SafeRouteHeaderProps> = ({
  onOpenPinHazard,
  onOpenReportSummary,
  onOpenAdminLogin,
  onOpenChatbot,
  tileTheme,
  onToggleTileTheme,
  isMuted,
  onToggleMute,
  pendingCount,
  onOpenOfflineMaps,
  isSimulatedOffline,
  cachedTilesCount,
  locationPermission,
  onRequestLocationRights,
}) => {
  const { currentUser, isAdmin, signInWithGoogle, logout } = useAuth();
  return (
    <header className="h-16 px-3 sm:px-4 bg-[#0a0e16]/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0 z-40 select-none">
      {/* Brand & Customer Tagline */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)] shrink-0">
          <ShieldCheck size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white uppercase font-sans">
              SafeRoute
            </h1>
            <span className="hidden xs:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              CITIZEN APP
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono-telemetry font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              🇮🇳 PAN-INDIA
            </span>
            {isSimulatedOffline && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono-telemetry font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1 animate-pulse">
                <WifiOff size={10} />
                <span>DEAD ZONE MODE</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
            Pan-India Safety Navigation &bull; Live Weather Alerts &bull; Gemini 3.8 Copilot
          </p>
        </div>
      </div>

      {/* Right Customer Action Tools & Admin Portal Link */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Gemini Safety Copilot Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenChatbot();
          }}
          title="SafeRoute AI Copilot (Gemini 3.8 Flash)"
          className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 hover:from-cyan-900/80 hover:to-blue-900/80 text-cyan-300 border border-cyan-500/40 text-xs font-mono-telemetry font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer animate-pulse"
        >
          <Bot size={14} className="text-cyan-400" />
          <span className="hidden sm:inline">AI COPILOT</span>
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Offline Maps Manager Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenOfflineMaps();
          }}
          title="Offline Maps & Cellular Dead Zone Cache"
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono-telemetry font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isSimulatedOffline
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
              : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          <HardDrive size={14} className={isSimulatedOffline ? 'text-amber-400' : 'text-cyan-400'} />
          <span className="hidden md:inline">OFFLINE MAPS</span>
          {cachedTilesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {cachedTilesCount}
            </span>
          )}
        </button>

        {/* Location Rights / GPS Status Badge */}
        <button
          onClick={() => {
            soundFx.playClick();
            onRequestLocationRights();
          }}
          title={
            locationPermission === 'denied'
              ? 'Location Rights Denied: Click to check browser permission'
              : locationPermission === 'granted'
              ? 'Location Rights Granted: Device GPS active'
              : 'Click to authorize high-accuracy device GPS'
          }
          className={`px-2 py-1.5 rounded-xl border text-[11px] font-mono-telemetry font-bold flex items-center gap-1 transition-colors cursor-pointer ${
            locationPermission === 'granted'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40'
              : locationPermission === 'denied'
              ? 'bg-rose-950/40 text-rose-300 border-rose-600/40'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          <Navigation size={13} className={locationPermission === 'granted' ? 'fill-emerald-400 text-emerald-400' : ''} />
          <span className="hidden lg:inline">
            {locationPermission === 'granted'
              ? 'GPS RIGHTS OK'
              : locationPermission === 'denied'
              ? 'GPS DENIED'
              : 'GPS RIGHTS'}
          </span>
        </button>

        {/* Project Report Modal */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenReportSummary();
          }}
          title="SafeRoute Project Report (Chapters 1–4)"
          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono-telemetry font-bold items-center gap-1.5 transition-colors hidden xl:flex cursor-pointer"
        >
          <BookOpen size={14} className="text-indigo-400" />
          <span>REPORT</span>
        </button>

        {/* Pin Hazard on map */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenPinHazard();
          }}
          className="px-3 py-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-[#0b0f17] font-bold text-xs font-mono-telemetry tracking-wide rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle size={14} />
          <span className="hidden xs:inline">REPORT</span>
        </button>

        {/* Tile theme toggle (Day vs Night) */}
        <button
          onClick={onToggleTileTheme}
          title={`Map Theme: ${tileTheme}`}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {tileTheme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        {/* Audio mute toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* Google Sign-In with Firebase Auth */}
        {currentUser ? (
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2 py-1">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Avatar"
                className="w-5 h-5 rounded-full object-cover border border-cyan-400/40"
              />
            ) : (
              <User size={14} className="text-cyan-400" />
            )}
            <div className="hidden md:flex flex-col text-[10px] leading-tight">
              <span className="text-slate-200 font-semibold truncate max-w-[80px]">
                {currentUser.displayName?.split(' ')[0] || 'User'}
              </span>
              {isAdmin && (
                <span className="text-emerald-400 font-bold text-[8px] uppercase">
                  ADMIN
                </span>
              )}
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signInWithGoogle()}
            title="Sign in with Google (Firebase Auth)"
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono-telemetry font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogIn size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">SIGN IN</span>
          </button>
        )}

        {/* Discreet Admin Device Link */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenAdminLogin();
          }}
          title={isAdmin ? "Open Admin Moderation Terminal (Verified)" : "Switch to Municipal Admin Terminal Device"}
          className={`px-2 py-1.5 rounded-xl text-xs font-mono-telemetry font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer ml-0.5 ${
            isAdmin
              ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/60'
              : 'bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60'
          }`}
        >
          <Lock size={12} className={isAdmin ? 'text-emerald-400' : 'text-indigo-400'} />
          <span className="hidden sm:inline">{isAdmin ? 'ADMIN VERIFIED' : 'ADMIN'}</span>
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
