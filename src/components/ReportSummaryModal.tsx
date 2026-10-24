import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Database, 
  Workflow, 
  CheckCircle, 
  DollarSign, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface ReportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportSummaryModal: React.FC<ReportSummaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeChapter, setActiveChapter] = useState<'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5'>('ch1');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                SafeRoute Project Report Summary (Chapters 1–4)
              </h2>
              <p className="text-[11px] font-mono-telemetry text-slate-400">
                Academic Capstone Specification & System Architecture
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 overflow-x-auto text-xs font-mono-telemetry shrink-0">
          {[
            { id: 'ch1', label: '1. Executive Summary' },
            { id: 'ch2', label: '2. Feasibility Evaluation' },
            { id: 'ch3', label: '3. Technology Stack' },
            { id: 'ch4', label: '4. Database & 5 Collections' },
            { id: 'ch5', label: '5. DFD & UML Flows' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveChapter(tab.id as any);
              }}
              className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
                activeChapter === tab.id
                  ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chapter Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed font-sans flex-1">
          {activeChapter === 'ch1' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">1. Executive Summary & Core Concept</h3>
              <p>
                <strong>SafeRoute</strong> is a community-driven, web-based safety navigation layer designed to address qualitative, localized urban risks that traditional navigation tools like Google Maps overlook:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-amber-400 block text-xs">💡 Unlit Streets & Outages</strong>
                  <p className="text-[11px] text-slate-400 mt-1">Streets with broken municipal streetlights causing complete darkness.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-indigo-400 block text-xs">👁️ Isolated Stretches</strong>
                  <p className="text-[11px] text-slate-400 mt-1">Desolate routes alongside closed warehouses or blank walls with zero bystanders.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-orange-400 block text-xs">🐾 Stray Animal Clusters</strong>
                  <p className="text-[11px] text-slate-400 mt-1">Territorial packs of aggressive dogs congregating around dumpsters after dark.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-rose-400 block text-xs">📵 Cellular Dead Zones</strong>
                  <p className="text-[11px] text-slate-400 mt-1">Areas with complete GSM/LTE signal attenuation where emergency calls drop.</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-200">
                <strong>Core Triad Architecture:</strong> Citizens report hazards on an interactive map &rarr; Edge IoT sensors (ESP32) detect physical conditions &rarr; Administrative moderation queue filters all entries before making them visible on the public safety map layer.
              </div>
            </div>
          )}

          {activeChapter === 'ch2' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">2. Multi-Dimensional Feasibility Evaluation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <strong className="text-emerald-400 text-sm block mb-1">💰 Economic Feasibility (Rs. 0 / $0 Cost)</strong>
                  <p className="text-xs text-slate-400">
                    Achieves zero budget operational cost by using an entirely open-source stack: React, Leaflet, OpenStreetMap, and Node.js. Avoids pay-per-load commercial map charges (Google Maps Platform APIs cost $7 per 1,000 requests). MongoDB Atlas free tier provides cloud data storage.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <strong className="text-cyan-400 text-sm block mb-1">⚡ Technical Feasibility (2dsphere Indexing)</strong>
                  <p className="text-xs text-slate-400">
                    Employs MongoDB’s native <code>2dsphere</code> spherical geospatial indexing, enabling fast spatial proximity queries ($near, $geoWithin) in <span className="font-mono text-cyan-300">O(log N)</span> time without the computational overhead of manual mathematical distance formulas.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <strong className="text-amber-400 text-sm block mb-1">🛡️ Operational Feasibility (Anti-Fraud)</strong>
                  <p className="text-xs text-slate-400">
                    Accessible on desktop and mobile without native installations. Mitigates fraudulent crowdsourced entries via an administrative moderation queue and automated, hardware-verified IoT ingestion.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <strong className="text-purple-400 text-sm block mb-1">📅 Time Feasibility (Academic Cycle)</strong>
                  <p className="text-xs text-slate-400">
                    Phased across two semesters: <strong>Semester 5:</strong> Requirements gathering, tech stack selection, schema modeling, and UML designs (Chapters 1–4). <strong>Semester 6:</strong> Full-stack coding, API integration, testing, and deployment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeChapter === 'ch3' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">3. Technology Stack & Architectural Rationale</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono-telemetry">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">LAYER</th>
                      <th className="p-3">TECHNOLOGY</th>
                      <th className="p-3">PRIMARY ROLE & JUSTIFICATION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="p-3 text-cyan-300">Frontend</td>
                      <td className="p-3 font-bold text-white">React.js (v18+)</td>
                      <td className="p-3">Component modularity and Virtual DOM diffing isolate sidebar/filter updates, preventing heavy map canvas re-renders.</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-cyan-300">Map Rendering</td>
                      <td className="p-3 font-bold text-white">Leaflet.js + OSM</td>
                      <td className="p-3">Lightweight (~42 KB minified) with zero API licensing fees; captures exact mouse-click coordinates directly from the screen canvas.</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-cyan-300">Styling</td>
                      <td className="p-3 font-bold text-white">Tailwind CSS</td>
                      <td className="p-3">Utility-first, responsive dashboard layout adapted across mobile and desktop browsers.</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-cyan-300">Backend</td>
                      <td className="p-3 font-bold text-white">Node.js + Express</td>
                      <td className="p-3">Asynchronous, non-blocking I/O handles concurrent crowdsourced and automated IoT data streams without thread-locking.</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-cyan-300">Database</td>
                      <td className="p-3 font-bold text-white">MongoDB Atlas</td>
                      <td className="p-3">Stores coordinates natively as GeoJSON Point arrays [lng, lat] with a 2dsphere index for sub-200ms proximity queries.</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-cyan-300">Authentication</td>
                      <td className="p-3 font-bold text-white">JWT & bcrypt</td>
                      <td className="p-3">Stateless token-based session verification with encrypted password hashing.</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-cyan-300">IoT Telemetry</td>
                      <td className="p-3 font-bold text-white">ESP32 SoC (LDR, GPS, SIM800L)</td>
                      <td className="p-3">Captures and transmits physical environmental hazard data to POST /api/iot/hazard.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeChapter === 'ch4' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">4. Database Architecture & 5 Collections</h3>
              <p>The schema comprises five interconnected collections designed with strict enum constraints and spatial indexing:</p>

              <div className="space-y-3 font-mono-telemetry text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-cyan-400 block mb-1">1. USERS</strong>
                  <code className="text-slate-400 text-[11px]">{`{ userId: String, name: String, email: String, passwordHash: String, createdAt: Date }`}</code>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-cyan-400 block mb-1">2. ADMINS</strong>
                  <code className="text-slate-400 text-[11px]">{`{ adminId: String, userId: ObjectId(USERS), badgeNumber: String, department: String, createdAt: Date }`}</code>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-cyan-400 block mb-1">3. IOT_EVENTS</strong>
                  <code className="text-slate-400 text-[11px]">{`{ iotEventId: String, deviceId: String, hazardType: Enum, location: { type: "Point", coordinates: [lng, lat] }, confidence: Number, receivedAt: Date }`}</code>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-amber-400 block mb-1">4. HAZARDS (Core Collection with 2dsphere index)</strong>
                  <code className="text-slate-400 text-[11px]">{`{ hazardId: String, type: Enum, severity: Enum, description: String, location: { type: "Point", coordinates: [lng, lat] }, status: "Pending" | "Verified" | "Rejected", source: "User" | "IoT", userId: ObjectId(USERS), iotEventId: ObjectId(IOT_EVENTS) }`}</code>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-emerald-400 block mb-1">5. HAZARD_VERIFICATIONS (Audit Trail)</strong>
                  <code className="text-slate-400 text-[11px]">{`{ verificationId: String, hazardId: ObjectId(HAZARDS), adminId: ObjectId(ADMINS), action: "Approved" | "Rejected", remarks: String, verifiedAt: Date }`}</code>
                </div>
              </div>
            </div>
          )}

          {activeChapter === 'ch5' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">5. Behavioral & System Modeling (UML Overview)</h3>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono-telemetry text-xs">
                <strong className="text-white block text-sm">Sequence & Activity Flows:</strong>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>A citizen pins a hazard on Leaflet map or an ESP32 IoT sensor detects low lux / dead zone.</li>
                  <li>The Express server records the hazard in the MongoDB database with status set to <span className="text-amber-400 font-bold">Pending</span>.</li>
                  <li>An administrator audits pending entries via the <span className="text-indigo-400 font-bold">Admin Moderation Dashboard</span>.</li>
                  <li>If approved, the record status updates to <span className="text-emerald-400 font-bold">Verified</span> and immediately populates onto the active public Leaflet map layer.</li>
                  <li>The review action is immutably logged in the <span className="text-cyan-400 font-bold">HAZARD_VERIFICATIONS</span> collection.</li>
                </ol>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono-telemetry text-[11px] text-cyan-300">
                [Citizen / IoT Node] &rarr; (POST /api/hazards) &rarr; [DB: status: 'Pending'] &rarr; [Admin Review Queue] &rarr; (Approve) &rarr; [Public Leaflet OSM Map Layer: 'Verified']
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
