import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  AlertTriangle, 
  Clock, 
  User, 
  Cpu, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MapPin, 
  Filter,
  History
} from 'lucide-react';
import { HazardDoc, HazardVerificationDoc } from '../types/saferoute';
import { soundFx } from '../utils/sound';

interface AdminModerationQueueProps {
  pendingHazards: HazardDoc[];
  allHazards: HazardDoc[];
  verifications: HazardVerificationDoc[];
  onApproveHazard: (hazardId: string, remarks?: string) => void;
  onRejectHazard: (hazardId: string, remarks: string) => void;
  onSelectOnMap: (hazard: HazardDoc) => void;
  adminName: string;
}

export const AdminModerationQueue: React.FC<AdminModerationQueueProps> = ({
  pendingHazards,
  allHazards,
  verifications,
  onApproveHazard,
  onRejectHazard,
  onSelectOnMap,
  adminName,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'audit' | 'all'>('queue');
  const [rejectingHazard, setRejectingHazard] = useState<HazardDoc | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'User' | 'IoT'>('all');

  const filteredPending = pendingHazards.filter(
    (h) => filterSource === 'all' || h.source === filterSource
  );

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingHazard) return;
    soundFx.playClick();
    onRejectHazard(rejectingHazard.hazardId, rejectionRemarks || 'Administrative rejection: Did not meet verification threshold.');
    setRejectingHazard(null);
    setRejectionRemarks('');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] text-slate-200">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                ADMINISTRATIVE MODERATION QUEUE
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-telemetry bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                {pendingHazards.length} PENDING
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono-telemetry">
              Signed in as: <strong className="text-indigo-300">{adminName}</strong> (Role: Administrator)
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono-telemetry">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('queue');
            }}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
              activeTab === 'queue' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={13} />
            <span>Pending Review ({pendingHazards.length})</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('audit');
            }}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
              activeTab === 'audit' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History size={13} />
            <span>Verification Audit Log ({verifications.length})</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('all');
            }}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
              activeTab === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>All Hazards ({allHazards.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab 1: Pending Moderation Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            {/* Filter bar */}
            <div className="flex items-center justify-between text-xs font-mono-telemetry text-slate-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Filter size={13} />
                FILTER BY INGESTION SOURCE:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterSource('all')}
                  className={`px-2.5 py-1 rounded border ${
                    filterSource === 'all' ? 'bg-slate-800 border-slate-600 text-white' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  All ({pendingHazards.length})
                </button>
                <button
                  onClick={() => setFilterSource('User')}
                  className={`px-2.5 py-1 rounded border ${
                    filterSource === 'User' ? 'bg-slate-800 border-slate-600 text-white' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  Citizen Reports ({pendingHazards.filter((h) => h.source === 'User').length})
                </button>
                <button
                  onClick={() => setFilterSource('IoT')}
                  className={`px-2.5 py-1 rounded border ${
                    filterSource === 'IoT' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  ESP32 IoT Alerts ({pendingHazards.filter((h) => h.source === 'IoT').length})
                </button>
              </div>
            </div>

            {filteredPending.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-white">All Pending Submissions Reviewed</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  The moderation queue is clear. New citizen map clicks and ESP32 telemetry events will automatically appear here for verification.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPending.map((hazard) => (
                  <div
                    key={hazard.hazardId}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono-telemetry font-bold ${
                            hazard.severity === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          }`}>
                            {hazard.severity} SEVERITY
                          </span>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono-telemetry font-bold ${
                            hazard.source === 'IoT' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {hazard.source === 'IoT' ? 'ESP32 TELEMETRY' : 'CITIZEN REPORT'}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono-telemetry text-amber-400 font-bold">
                          STATUS: PENDING
                        </span>
                      </div>

                      {/* Hazard Type & Title */}
                      <h3 className="mt-2 text-sm font-bold text-white">
                        {hazard.type}
                      </h3>

                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                        {hazard.description}
                      </p>

                      {/* Location & Metadata */}
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono-telemetry space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-cyan-400" />
                            Location:
                          </span>
                          <span className="text-white truncate max-w-[200px]">{hazard.address}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Geo Coordinates:</span>
                          <span className="text-cyan-300 font-bold">
                            [{hazard.location.coordinates[0]}, {hazard.location.coordinates[1]}]
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Reporter / Node:</span>
                          <span className="text-indigo-300">{hazard.userName || hazard.iotEventId || 'ESP32 Auto Sensor'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          onSelectOnMap(hazard);
                        }}
                        className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-telemetry flex items-center gap-1 transition-colors"
                      >
                        <Eye size={12} />
                        <span>Locate on Map</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            setRejectingHazard(hazard);
                          }}
                          className="px-3 py-1.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-mono-telemetry font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <X size={13} />
                          <span>REJECT</span>
                        </button>

                        <button
                          onClick={() => {
                            soundFx.playWaypointPing();
                            onApproveHazard(hazard.hazardId, 'Verified and confirmed for public map visibility.');
                          }}
                          className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-mono-telemetry font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                        >
                          <Check size={14} />
                          <span>APPROVE (VERIFY)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Verification Audit Log (HAZARD_VERIFICATIONS) */}
        {activeTab === 'audit' && (
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200">
              <strong>Database Collection: <code>HAZARD_VERIFICATIONS</code></strong> (Chapter 4 Schema)
              <p className="text-[11px] text-slate-400 mt-0.5">
                Maintains an immutable audit log of administrative review decisions with timestamp, administrator ID, outcome, and justification remarks.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs font-mono-telemetry">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">VERIFICATION ID</th>
                    <th className="p-3">HAZARD TYPE</th>
                    <th className="p-3">ACTION</th>
                    <th className="p-3">ADMIN ID / NAME</th>
                    <th className="p-3">REMARKS</th>
                    <th className="p-3">VERIFIED AT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {verifications.map((v) => (
                    <tr key={v.verificationId} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{v.verificationId}</td>
                      <td className="p-3 text-cyan-300">{v.hazardType}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.action === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {v.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200">{v.adminName}</td>
                      <td className="p-3 text-slate-300 max-w-xs">{v.remarks}</td>
                      <td className="p-3 text-slate-500">{new Date(v.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: All Hazards Collection */}
        {activeTab === 'all' && (
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs font-mono-telemetry">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">HAZARD ID</th>
                    <th className="p-3">TYPE</th>
                    <th className="p-3">SEVERITY</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">SOURCE</th>
                    <th className="p-3">COORDINATES</th>
                    <th className="p-3">UPVOTES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {allHazards.map((h) => (
                    <tr key={h.hazardId} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{h.hazardId}</td>
                      <td className="p-3 text-white">{h.type}</td>
                      <td className="p-3">{h.severity}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-300' : h.status === 'Pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="p-3">{h.source}</td>
                      <td className="p-3 text-cyan-300">[{h.location.coordinates[0]}, {h.location.coordinates[1]}]</td>
                      <td className="p-3 text-amber-400 font-bold">{h.upvotes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Remarks Modal */}
      {rejectingHazard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Reject Hazard Submission
            </h3>
            <p className="mt-1 text-xs text-slate-400 font-mono-telemetry">
              Provide justification remarks for the audit trail before rejecting {rejectingHazard.type} ({rejectingHazard.hazardId}).
            </p>

            <form onSubmit={handleConfirmReject} className="mt-4 space-y-3">
              <textarea
                rows={3}
                required
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                placeholder="Reason (e.g. Duplicate report, municipal streetlights already repaired, unsubstantiated noise)..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500 resize-none font-sans"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingHazard(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-mono-telemetry"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono-telemetry font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
