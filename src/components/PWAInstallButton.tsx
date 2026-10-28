import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';
import { soundFx } from '../utils/sound';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, don't show prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={() => {
          soundFx.playClick();
          install();
        }}
        title="Install SafeRoute PWA for offline use"
        className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-mono-telemetry font-extrabold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:opacity-95 transition-all cursor-pointer"
      >
        <Download size={13} className="stroke-[2.5]" />
        <span className="hidden sm:inline">INSTALL APP</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => {
            soundFx.playClick();
            setShowIOSGuide(true);
          }}
          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono-telemetry font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Smartphone size={13} className="text-cyan-400" />
          <span className="hidden sm:inline">INSTALL</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
            <div className="w-full max-w-sm rounded-2xl bg-[#0f172a] border border-slate-700 p-5 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone size={16} className="text-cyan-400" />
                  <span>Install SafeRoute on iOS</span>
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p>To use SafeRoute with offline maps on your iPhone/iPad:</p>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 text-xs">
                  <li>
                    Tap the <strong>Share</strong> button <span className="text-cyan-300">⎋</span> in the Safari navigation bar.
                  </li>
                  <li>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </li>
                  <li>Open SafeRoute from your home screen for full offline GPS support.</li>
                </ol>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
