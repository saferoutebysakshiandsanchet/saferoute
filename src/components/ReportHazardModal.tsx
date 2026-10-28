import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  Lightbulb, 
  Dog, 
  Radio, 
  ShieldAlert, 
  EyeOff, 
  CheckCircle2, 
  Clock, 
  Info 
} from 'lucide-react';
import { HazardDoc, HazardType, HazardSeverity } from '../types/saferoute';
import { soundFx } from '../utils/sound';

interface ReportHazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitHazard: (hazard: Omit<HazardDoc, 'hazardId' | 'createdAt' | 'upvotes'>) => void;
  clickedCoordinates: { lat: number; lng: number } | null;
  currentUserName: string;
}

export const ReportHazardModal: React.FC<ReportHazardModalProps> = ({
  isOpen,
  onClose,
  onSubmitHazard,
  clickedCoordinates,
  currentUserName,
}) => {
  const [type, setType] = useState<HazardType>('Unlit Street');
  const [severity, setSeverity] = useState<HazardSeverity>('High');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const lat = clickedCoordinates?.lat ?? 18.5255;
  const lng = clickedCoordinates?.lng ?? 73.8510;

  const hazardTypes: { type: HazardType; label: string; icon: React.FC<{ size: number; className?: string }>; desc: string }[] = [
    { type: 'Unlit Street', label: 'Unlit Street / Broken Lights', icon: Lightbulb, desc: 'Fused lamps, blacked-out alleys, poor lux levels' },
    { type: 'Isolated Stretch', label: 'Isolated Stretch', icon: EyeOff, desc: 'No foot traffic, closed warehouses, desolate turns' },
    { type: 'Waterlogging / Heavy Rain', label: 'Waterlogging / Flooding', icon: AlertTriangle, desc: 'Deep standing water, submerged footpaths, open drain risk' },
    { type: 'Dense Fog / Low Visibility', label: 'Dense Fog / Low Visibility', icon: EyeOff, desc: 'Thick fog or smog, severe pedestrian collision risk' },
    { type: 'Stray Animal Cluster', label: 'Stray Animal Cluster', icon: Dog, desc: 'Territorial packs, aggressive street dogs, bite hazards' },
    { type: 'Cellular Dead Zone', label: 'Cellular Dead Zone', icon: Radio, desc: 'Zero mobile signal, call drops, SOS failure zones' },
    { type: 'Harassment Hotspot', label: 'Harassment Hotspot', icon: ShieldAlert, desc: 'Loitering groups, stalking, catcalling corners' },
    { type: 'Flooded / Blocked Path', label: 'Flooded / Blocked Path', icon: AlertTriangle, desc: 'Open construction pits, broken sidewalk' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playWaypointPing();

    onSubmitHazard({
      type,
      severity,
      description: description.trim() || `Reported ${type} near ${address || 'selected coordinates'}`,
      address: address.trim() || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
      location: {
        type: 'Point',
        coordinates: [Number(lng.toFixed(6)), Number(lat.toFixed(6))], // GeoJSON [lng, lat]
      },
      status: 'Pending', // Enforces Chapter 1–4 admin moderation review workflow!
      source: 'User',
      userName: currentUserName,
    });

    setDescription('');
    setAddress('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                PIN HAZARD ON SAFETY MAP
              </h3>
              <p className="text-[11px] font-mono-telemetry text-slate-400">
                SafeRoute Community Crowdsourced Ingestion
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Moderation Workflow Architecture Notice */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
            <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Administrative Review Policy:</strong> To prevent fraudulent pins, your submission will be routed to the <strong>Administrative Moderation Queue</strong> with status <code>Pending</code>. Once verified by an admin or cross-referenced with IoT telemetry, it will publish to the public map.
            </span>
          </div>

          {/* Captured Coordinates Badge */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono-telemetry">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MapPin size={14} className="text-cyan-400" />
              GeoJSON Point [lng, lat]:
            </span>
            <span className="text-cyan-300 font-bold">
              [{lng.toFixed(5)}, {lat.toFixed(5)}]
            </span>
          </div>

          {/* Hazard Type Grid */}
          <div>
            <label className="block text-xs font-mono-telemetry text-slate-300 uppercase tracking-wider mb-2">
              1. SELECT QUALITATIVE HAZARD TYPE
            </label>
            <div className="grid grid-cols-2 gap-2">
              {hazardTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setType(item.type);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Icon size={16} className={isSelected ? 'text-amber-400 mt-0.5' : 'text-slate-500 mt-0.5'} />
                    <div>
                      <div className="text-xs font-bold leading-tight text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity Radio Buttons */}
          <div>
            <label className="block text-xs font-mono-telemetry text-slate-300 uppercase tracking-wider mb-2">
              2. SEVERITY LEVEL
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['High', 'Medium', 'Low'] as HazardSeverity[]).map((sev) => {
                const isSel = severity === sev;
                const color = sev === 'High' ? 'text-red-400 border-red-500 bg-red-500/20' : sev === 'Medium' ? 'text-orange-400 border-orange-500 bg-orange-500/20' : 'text-yellow-400 border-yellow-500 bg-yellow-500/20';
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setSeverity(sev);
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono-telemetry font-bold transition-all ${
                      isSel ? color : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {sev.toUpperCase()} SEVERITY
                  </button>
                );
              })}
            </div>
          </div>

          {/* Landmark / Street Name */}
          <div>
            <label className="block text-xs font-mono-telemetry text-slate-300 uppercase tracking-wider mb-1">
              3. STREET / LANDMARK ADDRESS
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Fergusson College Lane 3 / Behind old bus terminus"
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 font-sans placeholder:text-slate-500"
            />
          </div>

          {/* Detailed Observations */}
          <div>
            <label className="block text-xs font-mono-telemetry text-slate-300 uppercase tracking-wider mb-1">
              4. SPECIFIC OBSERVATIONS & TIME OF OCCURRENCE
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the hazard conditions (e.g. 4 stray dogs blocking the pathway after 9 PM, no streetlights functioning for 200 meters)..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-sans placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-[#0b0f17] font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>SUBMIT REPORT (STATUS: PENDING REVIEW)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
