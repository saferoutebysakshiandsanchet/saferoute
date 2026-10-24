import React, { useState } from 'react';
import { 
  X, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ThumbsUp, 
  Check, 
  ShieldCheck, 
  Activity, 
  Navigation,
  Clock,
  Radio
} from 'lucide-react';
import { HazardIncident, SeverityTier } from '../types/sentinel';
import { soundFx } from '../utils/sound';

interface IncidentCardModalProps {
  incident: HazardIncident;
  onClose: () => void;
  onVoteStillHere: (id: string) => void;
  onVoteClear: (id: string) => void;
  onRerouteAround: (incident: HazardIncident) => void;
}

export const IncidentCardModal: React.FC<IncidentCardModalProps> = ({
  incident,
  onClose,
  onVoteStillHere,
  onVoteClear,
  onRerouteAround,
}) => {
  const [hasVotedHere, setHasVotedHere] = useState(false);
  const [hasVotedClear, setHasVotedClear] = useState(false);

  const getSeverityBadge = (tier: SeverityTier) => {
    switch (tier) {
      case 'high':
        return {
          label: 'HIGH HAZARD / EMERGENCY',
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.4)',
          icon: AlertOctagon,
        };
      case 'elevated':
        return {
          label: 'ELEVATED WARNING',
          color: '#f97316',
          bg: 'rgba(249, 115, 22, 0.15)',
          border: 'rgba(249, 115, 22, 0.4)',
          icon: AlertTriangle,
        };
      case 'caution':
        return {
          label: 'CAUTIONARY NOTICE',
          color: '#eab308',
          bg: 'rgba(234, 179, 8, 0.15)',
          border: 'rgba(234, 179, 8, 0.4)',
          icon: Info,
        };
      case 'safe':
        return {
          label: 'VERIFIED SAFE / ESCORT',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.4)',
          icon: CheckCircle2,
        };
    }
  };

  const badge = getSeverityBadge(incident.severity);
  const BadgeIcon = badge.icon;

  const handleStillHere = () => {
    if (!hasVotedHere) {
      soundFx.playClick();
      setHasVotedHere(true);
      if (hasVotedClear) setHasVotedClear(false);
      onVoteStillHere(incident.id);
    }
  };

  const handleClear = () => {
    if (!hasVotedClear) {
      soundFx.playClick();
      setHasVotedClear(true);
      if (hasVotedHere) setHasVotedHere(false);
      onVoteClear(incident.id);
    }
  };

  return (
    <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-30 pointer-events-auto">
      <div 
        className="tactical-glass-1 rounded-lg p-4 shadow-2xl border border-slate-700/60 overflow-hidden relative"
        style={{
          boxShadow: incident.severity === 'high' 
            ? '0 0 24px -2px rgba(239, 68, 68, 0.35)' 
            : '0 12px 32px -4px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Supervisor moderation left-border cue */}
        {incident.supervisorVerified && (
          <div 
            className="absolute top-0 bottom-0 left-0 w-[4px] bg-[#8b5cf6]" 
            title="Municipal Telemetry Verified" 
          />
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2 pl-2">
          {/* Chip & Severity Badge */}
          <div 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono-telemetry font-semibold uppercase"
            style={{
              backgroundColor: badge.bg,
              border: `1px solid ${badge.border}`,
              color: badge.color,
            }}
          >
            <span 
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: badge.color,
                boxShadow: `0 0 6px ${badge.color}`,
              }}
            />
            <BadgeIcon size={12} />
            <span>{badge.label}</span>
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

        {/* Title & Description */}
        <div className="mt-3 pl-2">
          <h3 className="text-base font-bold text-[#f8fafc] leading-tight">
            {incident.title}
          </h3>
          <p className="mt-1 text-xs text-[#94a3b8] leading-relaxed">
            {incident.description}
          </p>
        </div>

        {/* Monospace Telemetry Grid */}
        <div className="mt-3 pl-2 py-2 border-y border-slate-700/40 grid grid-cols-2 gap-2 text-[11px] font-mono-telemetry text-slate-300">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-amber-400 shrink-0" />
            <span className="text-slate-400">Reported:</span>
            <span className="text-white font-medium">{incident.timeAgoMinutes}m ago</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-[#8b5cf6] shrink-0" />
            <span className="text-slate-400">Confidence:</span>
            <span className="text-[#8b5cf6] font-semibold">{incident.sourceConfidence}%</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Radio size={12} className="text-teal-400 shrink-0" />
            <span className="text-slate-400">Geo ID:</span>
            <span className="truncate text-teal-300">{incident.municipalId}</span>
          </div>

          {incident.acousticDecibels && (
            <div className="flex items-center gap-1.5">
              <Activity size={12} className="text-rose-400 shrink-0" />
              <span className="text-slate-400">Acoustic:</span>
              <span className="text-rose-400 font-semibold">{incident.acousticDecibels} dB(A)</span>
            </div>
          )}
        </div>

        {/* Verification Voting Actions */}
        <div className="mt-3 pl-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStillHere}
              className={`px-3 py-1.5 rounded text-xs font-mono-telemetry font-medium flex items-center gap-1.5 border transition-all ${
                hasVotedHere
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/60'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:border-slate-500'
              }`}
            >
              <ThumbsUp size={12} />
              <span>STILL HERE ({incident.stillHereCount})</span>
            </button>

            <button
              onClick={handleClear}
              className={`px-3 py-1.5 rounded text-xs font-mono-telemetry font-medium flex items-center gap-1.5 border transition-all ${
                hasVotedClear
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:border-slate-500'
              }`}
            >
              <Check size={12} />
              <span>CLEAR ({incident.clearCount})</span>
            </button>
          </div>

          <button
            onClick={() => onRerouteAround(incident)}
            title="Calculate detour avoiding this hazard"
            className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Navigation size={12} />
            <span>AVOID</span>
          </button>
        </div>
      </div>
    </div>
  );
};
