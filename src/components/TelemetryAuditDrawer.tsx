import React from 'react';
import { 
  X, 
  Activity, 
  Radio, 
  Eye, 
  Lightbulb, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  Volume2, 
  Wifi, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { HazardIncident, SafeHaven, TelemetryMetric } from '../types/sentinel';
import { soundFx } from '../utils/sound';

interface TelemetryAuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: TelemetryMetric[];
  incidents: HazardIncident[];
  safeHavens: SafeHaven[];
  showRadarSweep: boolean;
  onToggleRadar: () => void;
  showLightingHeat: boolean;
  onToggleLighting: () => void;
  showCCTVCoverage: boolean;
  onToggleCCTV: () => void;
  onSelectIncident: (inc: HazardIncident) => void;
}

export const TelemetryAuditDrawer: React.FC<TelemetryAuditDrawerProps> = ({
  isOpen,
  onClose,
  metrics,
  incidents,
  safeHavens,
  showRadarSweep,
  onToggleRadar,
  showLightingHeat,
  onToggleLighting,
  showCCTVCoverage,
  onToggleCCTV,
  onSelectIncident,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md z-40 bg-[#0f131c]/95 backdrop-blur-xl border-l border-slate-700/80 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={18} className="text-[#8b5cf6]" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              CIVIC TELEMETRY AUDIT
            </h3>
            <p className="text-[10px] font-mono-telemetry text-slate-400">
              PATROL OPERATIONS DASHBOARD
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Layer Filtering Toggles */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono-telemetry font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            <Layers size={13} className="text-cyan-400" />
            <span>SENSOR OVERLAY FILTERS</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleRadar();
              }}
              className={`p-2.5 rounded-lg border text-xs font-mono-telemetry flex flex-col items-center gap-1.5 transition-all ${
                showRadarSweep
                  ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Radio size={16} className={showRadarSweep ? 'animate-pulse' : ''} />
              <span>RADAR PULSE</span>
              <span className="text-[9px] uppercase font-bold text-cyan-400">
                {showRadarSweep ? 'ACTIVE' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onToggleLighting();
              }}
              className={`p-2.5 rounded-lg border text-xs font-mono-telemetry flex flex-col items-center gap-1.5 transition-all ${
                showLightingHeat
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Lightbulb size={16} />
              <span>LUX HEATMAP</span>
              <span className="text-[9px] uppercase font-bold text-amber-400">
                {showLightingHeat ? 'ACTIVE' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onToggleCCTV();
              }}
              className={`p-2.5 rounded-lg border text-xs font-mono-telemetry flex flex-col items-center gap-1.5 transition-all ${
                showCCTVCoverage
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Eye size={16} />
              <span>CCTV MESH</span>
              <span className="text-[9px] uppercase font-bold text-indigo-400">
                {showCCTVCoverage ? 'ACTIVE' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Real-time Hardware Metrics Grid */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono-telemetry font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            <Activity size={13} className="text-[#8b5cf6]" />
            <span>MUNICIPAL SENSOR METRICS</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {metrics.map((metric) => (
              <div
                key={metric.sensorId}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 font-mono-telemetry"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate">{metric.label}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-white">{metric.value}</span>
                  <span className="text-xs text-slate-400">{metric.unit}</span>
                </div>
                <div className="mt-1 text-[10px] text-slate-500 truncate">
                  {metric.location}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Incident Log Stream */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-mono-telemetry font-bold text-slate-400 uppercase tracking-wider">
              <AlertTriangle size={13} className="text-amber-400" />
              <span>LIVE INCIDENT STREAM ({incidents.length})</span>
            </div>
            <span className="text-[10px] font-mono-telemetry text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              STREAMING
            </span>
          </div>

          <div className="space-y-2">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => {
                  soundFx.playClick();
                  onSelectIncident(inc);
                }}
                className="p-3 rounded-lg bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate max-w-[220px]">
                    {inc.title}
                  </span>
                  <span className="text-[10px] font-mono-telemetry text-slate-400">
                    {inc.timeAgoMinutes}m ago
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                  {inc.description}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono-telemetry text-slate-400">
                  <span className="text-[#8b5cf6]">Conf: {inc.sourceConfidence}%</span>
                  <span className="text-amber-400">Votes: {inc.stillHereCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Registered Safe Havens */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono-telemetry font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            <ShieldCheck size={13} className="text-teal-400" />
            <span>SAFE-HAVEN HUBS IN SECTOR ({safeHavens.length})</span>
          </div>

          <div className="space-y-2">
            {safeHavens.map((sh) => (
              <div
                key={sh.id}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono-telemetry"
              >
                <div>
                  <div className="font-bold text-slate-200">{sh.name}</div>
                  <div className="text-[10px] text-slate-500">{sh.address}</div>
                </div>
                <div className="text-right">
                  <span className="text-cyan-400 font-semibold">{sh.distanceMeters}m</span>
                  <div className="text-[9px] text-emerald-400">24/7 OPEN</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
