import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  History, 
  Cpu, 
  MapPin, 
  BookOpen, 
  Smartphone, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  Eye, 
  X, 
  Check, 
  Building 
} from 'lucide-react';
import { HazardDoc, HazardVerificationDoc, IoTEventDoc } from '../types/saferoute';
import { AdminModerationQueue } from './AdminModerationQueue';
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
}) => {
  const [adminTab, setAdminTab] = useState<'queue' | 'audit' | 'iot' | 'report'>('queue');
  const [isReportOpen, setIsReportOpen] = useState(false);

  const pendingHazards = hazards.filter((h) => h.status === 'Pending');

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0f17] text-slate-200">
      {/* 1. MUNICIPAL ADMIN TERMINAL TOP BAR */}
      <header className="h-16 px-4 bg-[#111827] border-b border-indigo-500/40 flex items-center justify-between shrink-0 shadow-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <ShieldCheck size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold tracking-wide text-white font-sans uppercase">
                MUNICIPAL ADMIN TERMINAL
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono-telemetry bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40">
                OFFICIAL WORKSTATION #04
              </span>
            </div>
            <p className="text-[11px] font-mono-telemetry text-slate-400">
              Officer: <strong className="text-slate-200">Inspector R. Deshmukh</strong> (Badge: <span className="text-indigo-400">SR-MOD-8402</span>) &bull; Safety & Vigilance Cell
            </p>
          </div>
        </div>

        {/* Right Exit to Customer App Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsReportOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono-telemetry font-bold flex items-center gap-1.5 transition-colors hidden md:flex"
          >
            <BookOpen size={14} className="text-indigo-400" />
            <span>PROJECT REPORT</span>
          </button>

          {/* Prominent Button to Switch back to the Customer GPS App */}
          <button
            onClick={() => {
              soundFx.playClick();
              onExitToCustomerApp();
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-950 font-black text-xs font-mono-telemetry tracking-wide flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] cursor-pointer"
          >
            <Smartphone size={16} />
            <span>SWITCH TO CUSTOMER APP DEVICE</span>
          </button>
        </div>
      </header>

      {/* 2. ADMIN NAVIGATION TABS */}
      <div className="bg-[#0f172a] border-b border-slate-800 px-4 flex items-center gap-2 overflow-x-auto text-xs font-mono-telemetry shrink-0">
        <button
          onClick={() => {
            soundFx.playClick();
            setAdminTab('queue');
          }}
          className={`py-3 px-3.5 border-b-2 font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            adminTab === 'queue'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock size={14} />
          <span>MODERATION QUEUE</span>
          {pendingHazards.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
              {pendingHazards.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setAdminTab('audit');
          }}
          className={`py-3 px-3.5 border-b-2 font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            adminTab === 'audit'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History size={14} />
          <span>VERIFICATION AUDIT LOG ({verifications.length})</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setAdminTab('iot');
          }}
          className={`py-3 px-3.5 border-b-2 font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            adminTab === 'iot'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu size={14} />
          <span>ESP32 EDGE TELEMETRY GATEWAY</span>
        </button>
      </div>

      {/* 3. ADMIN WORKSTATION CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {adminTab === 'queue' && (
          <AdminModerationQueue
            pendingHazards={pendingHazards}
            allHazards={hazards}
            verifications={verifications}
            onApproveHazard={onApproveHazard}
            onRejectHazard={onRejectHazard}
            onSelectOnMap={onExitToCustomerApp}
            adminName="Inspector R. Deshmukh (Admin #SR-8402)"
          />
        )}

        {adminTab === 'audit' && (
          <div className="p-6 max-w-5xl mx-auto space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <History size={20} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono-telemetry">
                  IMMUTABLE AUDIT TRAIL: HAZARD_VERIFICATIONS
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Records all administrative review actions as defined in Chapter 4 schema. Proves administrative accountability for public safety map updates.
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
                    <th className="p-3">ADMIN OFFICER</th>
                    <th className="p-3">JUSTIFICATION REMARKS</th>
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

        {adminTab === 'iot' && (
          <ESP32Simulator
            onTransmitIoTEvent={onTransmitIoTEvent}
            currentMapCenter={currentMapCenter}
          />
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
