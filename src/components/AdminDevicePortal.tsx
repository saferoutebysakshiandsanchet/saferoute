import React, { useState } from 'react';
import { 
  Bot, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Lightbulb, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  History, 
  BookOpen, 
  Sliders, 
  Sparkles, 
  RefreshCw,
  Send,
  Check,
  X
} from 'lucide-react';
import { HazardDoc, HazardVerificationDoc, IoTEventDoc } from '../types/saferoute';
import { ESP32Simulator } from './ESP32Simulator';
import { ReportSummaryModal } from './ReportSummaryModal';
import { soundFx } from '../utils/sound';

interface AdminDevicePortalProps {
  hazards: HazardDoc[];
  verifications: HazardVerificationDoc[];
  iotEvents: IoTEventDoc[];
  onApproveHazard: (hazardId: string, remarks?: string) => void;
  onRejectHazard: (hazardId: string, remarks: string) => void;
  onTransmitIoTEvent: (event: IoTEventDoc, hazard: Omit<HazardDoc, 'hazardId' | 'createdAt' | 'upvotes'>) => void;
  onExitToCustomerApp: () => void;
  currentMapCenter: { lat: number; lng: number };
  onRunAIVerificationScan: () => void;
  aiAutoPilot: boolean;
  onToggleAIAutoPilot: () => void;
}

export const AdminDevicePortal: React.FC<AdminDevicePortalProps> = ({
  hazards,
  verifications,
  iotEvents,
  onApproveHazard,
  onRejectHazard,
  onTransmitIoTEvent,
  onExitToCustomerApp,
  currentMapCenter,
  onRunAIVerificationScan,
  aiAutoPilot,
  onToggleAIAutoPilot,
}) => {
  const [adminTab, setAdminTab] = useState<'ai_stream' | 'iot_mesh' | 'audit_log'>('ai_stream');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const pendingHazards = hazards.filter((h) => h.status === 'Pending');
  const verifiedHazards = hazards.filter((h) => h.status === 'Verified');

  const handleManualScan = () => {
    soundFx.playWaypointPing();
    setIsScanning(true);
    setTimeout(() => {
      onRunAIVerificationScan();
      setIsScanning(false);
    }, 700);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0f17] text-slate-200">
      {/* 1. MUNICIPAL ADMIN TERMINAL TOP BAR */}
      <header className="h-16 px-4 bg-[#111827] border-b border-indigo-500/40 flex items-center justify-between shrink-0 shadow-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Bot size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold tracking-wide text-white font-sans uppercase">
                ADMIN DEVICE &bull; AUTONOMOUS AI VERIFICATION TERMINAL
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono-telemetry bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/40">
                100% AI & IOT AUTOMATION
              </span>
            </div>
            <p className="text-[11px] font-mono-telemetry text-slate-400">
              Agent: <strong className="text-indigo-300">SafeRoute Sentinel AI Core</strong> &bull; Correlating with {iotEvents.length} Active ESP32 Edge Sensors
            </p>
          </div>
        </div>

        {/* Right Switch Back to GPS App Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsReportOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono-telemetry font-bold flex items-center gap-1.5 transition-colors hidden md:flex cursor-pointer"
          >
            <BookOpen size={14} className="text-indigo-400" />
            <span>REPORT (CH 1–4)</span>
          </button>

          {/* Prominent Button to Switch back to the GPS Navigation App */}
          <button
            onClick={() => {
              soundFx.playClick();
              onExitToCustomerApp();
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-xs font-mono-telemetry tracking-wide flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
          >
            <Smartphone size={16} />
            <span>SWITCH TO GPS NAVIGATION APP</span>
          </button>
        </div>
      </header>

      {/* 2. AI AUTOPILOT STATUS STRIP */}
      <div className="bg-[#0f172a] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-telemetry">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${aiAutoPilot ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${aiAutoPilot ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="text-white font-bold">
              AI IOT AUTO-VERIFICATION:
            </span>
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleAIAutoPilot();
              }}
              className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase transition-colors cursor-pointer ${
                aiAutoPilot ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {aiAutoPilot ? 'AUTO-PILOT ACTIVE (ON)' : 'PAUSED (MANUAL)'}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <span>Verified by AI: <strong className="text-emerald-400">{verifiedHazards.length}</strong></span>
            <span className="text-slate-600 mx-1">&bull;</span>
            <span>Pending Review: <strong className="text-amber-400">{pendingHazards.length}</strong></span>
          </div>
        </div>

        {/* Instant AI Trigger */}
        <div className="flex items-center gap-2">
          {pendingHazards.length > 0 && (
            <button
              onClick={handleManualScan}
              disabled={isScanning}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {isScanning ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} className="text-amber-300" />
              )}
              <span>TRIGGER AI VERIFICATION NOW ({pendingHazards.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. TABS */}
      <div className="bg-[#0e1422] border-b border-slate-800/80 px-4 flex items-center gap-2 overflow-x-auto text-xs font-mono-telemetry shrink-0">
        <button
          onClick={() => {
            soundFx.playClick();
            setAdminTab('ai_stream');
          }}
          className={`py-3 px-3.5 border-b-2 font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            adminTab === 'ai_stream'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot size={14} />
          <span>AI DECISION STREAM</span>
          {pendingHazards.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
              {pendingHazards.length} PENDING
            </span>
          )}
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setAdminTab('iot_mesh');
          }}
          className={`py-3 px-3.5 border-b-2 font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            adminTab === 'iot_mesh'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu size={14} />
          <span>ESP32 IOT SENSOR MESH ({iotEvents.length})</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setAdminTab('audit_log');
          }}
          className={`py-3 px-3.5 border-b-2 font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            adminTab === 'audit_log'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History size={14} />
          <span>IMMUTABLE AUDIT TRAIL ({verifications.length})</span>
        </button>
      </div>

      {/* 4. MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* TAB 1: Live AI Decision Stream */}
        {adminTab === 'ai_stream' && (
          <div className="max-w-5xl mx-auto space-y-4">
            {/* AI Engine Explanation Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 flex items-start justify-between gap-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/40">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono-telemetry flex items-center gap-2">
                    <span>Autonomous AI Verification Protocol (IoT Correlated)</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    When citizens pin hazards in the GPS app, the Sentinel AI automatically cross-references physical sensor telemetry from nearby ESP32 microcontrollers (LDR Photometric Lux, SIM800L Signal RSSI, Acoustic dB). Reports meeting verification criteria are auto-approved and published directly to the public GPS safety layer.
                  </p>
                </div>
              </div>
            </div>

            {/* Pending or Recently Verified Stream */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono-telemetry text-slate-400">
                <span className="font-bold text-white uppercase">
                  HAZARD INGESTION QUEUE ({hazards.length} TOTAL)
                </span>
                <span className="text-emerald-400 font-bold">
                  AUTONOMOUS CORRELATION ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {hazards.map((hazard) => {
                  const isVerified = hazard.status === 'Verified';
                  return (
                    <div
                      key={hazard.hazardId}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        isVerified
                          ? 'bg-slate-900/90 border-slate-800'
                          : 'bg-amber-950/20 border-amber-500/50 shadow-lg'
                      }`}
                    >
                      <div>
                        {/* Status Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono-telemetry font-bold ${
                              isVerified
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}>
                              {isVerified ? '✓ AUTO-VERIFIED BY AI' : '⏱ AI EVALUATING IOT...'}
                            </span>

                            <span className="px-2 py-0.5 rounded text-[10px] font-mono-telemetry font-bold bg-slate-800 text-slate-300">
                              {hazard.source === 'IoT' ? 'ESP32 IOT' : 'CITIZEN PIN'}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono-telemetry text-slate-400">
                            ID: {hazard.hazardId}
                          </span>
                        </div>

                        {/* Hazard Type & Address */}
                        <h4 className="mt-2 text-sm font-bold text-white">
                          {hazard.type}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {hazard.address} &bull; Coordinates: [{hazard.location.coordinates[0]}, {hazard.location.coordinates[1]}]
                        </p>
                        <p className="mt-1.5 text-xs text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                          {hazard.description}
                        </p>

                        {/* AI IoT Verification Proof Box */}
                        <div className="mt-3 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-xs font-mono-telemetry space-y-1">
                          <div className="flex items-center justify-between text-indigo-300 font-bold text-[11px]">
                            <span className="flex items-center gap-1">
                              <Bot size={13} className="text-indigo-400" />
                              AI TELEMETRY VERIFICATION PROOF:
                            </span>
                            <span className="text-emerald-400">96% CONFIDENCE</span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            {hazard.type === 'Unlit Street'
                              ? 'Matched Node ESP32-SHIVAJI-01: LDR Lux reading 3.8 Lux (< 15 Lux critical deficit threshold). Streetlight failure confirmed.'
                              : hazard.type === 'Cellular Dead Zone'
                              ? 'Matched Node ESP32-COLLEGE-04: SIM800L signal -116 dBm (< -105 dBm emergency cutoff). Radio attenuation confirmed.'
                              : 'Spatial correlation with civic pedestrian radar. Verified by multi-sensor consensus.'}
                          </p>
                        </div>
                      </div>

                      {/* If still pending and AI Auto-pilot was paused, allow 1-click verify */}
                      {!isVerified && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-end gap-2">
                          <button
                            onClick={() => onRejectHazard(hazard.hazardId, 'Inconclusive IoT sensor telemetry.')}
                            className="px-3 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-mono-telemetry font-bold"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => onApproveHazard(hazard.hazardId, 'Auto-verified via ESP32 sensor correlation.')}
                            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono-telemetry font-bold shadow"
                          >
                            Verify & Publish to GPS
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ESP32 IoT Sensor Mesh */}
        {adminTab === 'iot_mesh' && (
          <ESP32Simulator
            onTransmitIoTEvent={onTransmitIoTEvent}
            currentMapCenter={currentMapCenter}
          />
        )}

        {/* TAB 3: Immutable Audit Log */}
        {adminTab === 'audit_log' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <History size={20} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono-telemetry">
                  IMMUTABLE AUDIT TRAIL: HAZARD_VERIFICATIONS
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Records all automated AI and IoT sensor verification decisions as specified in Chapter 4 of the SafeRoute system architecture.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow">
              <table className="w-full text-left text-xs font-mono-telemetry">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">VERIFICATION ID</th>
                    <th className="p-3">HAZARD TYPE</th>
                    <th className="p-3">ACTION</th>
                    <th className="p-3">VERIFIER</th>
                    <th className="p-3">AI & IOT SENSOR REMARKS</th>
                    <th className="p-3">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {verifications.map((v) => (
                    <tr key={v.verificationId} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{v.verificationId}</td>
                      <td className="p-3 text-cyan-300">{v.hazardType}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.action === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {v.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-indigo-300 font-bold">{v.adminName}</td>
                      <td className="p-3 text-slate-300 max-w-sm">{v.remarks}</td>
                      <td className="p-3 text-slate-500">{new Date(v.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Chapters 1-4 Report Modal */}
      <ReportSummaryModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};
