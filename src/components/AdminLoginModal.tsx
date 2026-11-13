import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Key, 
  UserCheck, 
  AlertCircle,
  Building 
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const [badgePin, setBadgePin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 8402 (from Badge SR-MOD-8402) or any 4 digit
    if (badgePin === '8402' || badgePin.length >= 4) {
      soundFx.playWaypointPing();
      onSuccessLogin();
      setBadgePin('');
      setError('');
      onClose();
    } else {
      soundFx.playClick();
      setError('Invalid Admin PIN. Use official badge PIN 8402.');
    }
  };

  const handleQuickDemoAuth = () => {
    soundFx.playWaypointPing();
    onSuccessLogin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-[#0f172a] border border-indigo-500/40 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-sans">
                Municipal Admin Device Access
              </h3>
              <p className="text-[11px] font-mono-telemetry text-slate-400">
                Authorized Personnel Terminal Only
              </p>
            </div>
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

        {/* Info notice */}
        <div className="mt-3.5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200 space-y-1.5">
          <div className="flex items-start gap-2">
            <Building size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <span>
              This terminal provides administrative oversight of the <strong>SafeRoute Moderation Queue</strong> and ESP32 IoT alerts.
            </span>
          </div>
          <div className="text-[11px] text-emerald-300 font-mono bg-emerald-950/40 border border-emerald-500/30 rounded px-2 py-1 flex items-center justify-between">
            <span>Super Admin Email:</span>
            <strong>saferoutetyproject@gmail.com</strong>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-mono-telemetry text-slate-300 uppercase mb-1">
              Administrator ID / Badge:
            </label>
            <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono-telemetry text-slate-300 flex items-center justify-between">
              <span>Inspector R. Deshmukh</span>
              <span className="text-indigo-400 font-bold">SR-MOD-8402</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono-telemetry text-slate-300 uppercase">
                4-Digit Security PIN:
              </label>
              <button
                type="button"
                onClick={() => setBadgePin('8402')}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                Auto-fill: 8402
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={badgePin}
                onChange={(e) => {
                  setBadgePin(e.target.value);
                  setError('');
                }}
                placeholder="Enter PIN: 8402"
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 font-mono-telemetry placeholder:text-slate-500"
              />
              <Lock size={16} className="absolute right-3 top-3 text-slate-500" />
            </div>
            {error && <p className="text-xs text-rose-400 mt-1 font-mono-telemetry">{error}</p>}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <Key size={14} />
              <span>Unlock Admin Terminal (PIN: 8402)</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoAuth}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-telemetry rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserCheck size={14} className="text-emerald-400" />
              <span>Quick Demo: Switch to Admin Device Directly</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
