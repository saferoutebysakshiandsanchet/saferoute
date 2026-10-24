import React, { useState } from 'react';
import { 
  Cpu, 
  Lightbulb, 
  Radio, 
  Wifi, 
  Battery, 
  Navigation, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  RefreshCw 
} from 'lucide-react';
import { IoTEventDoc, HazardDoc, HazardType } from '../types/saferoute';
import { soundFx } from '../utils/sound';

interface ESP32SimulatorProps {
  onTransmitIoTEvent: (event: IoTEventDoc, hazard: Omit<HazardDoc, 'hazardId' | 'createdAt' | 'upvotes'>) => void;
  currentMapCenter: { lat: number; lng: number };
}

export const ESP32Simulator: React.FC<ESP32SimulatorProps> = ({
  onTransmitIoTEvent,
  currentMapCenter,
}) => {
  const [deviceId, setDeviceId] = useState('ESP32-NODE-SHIVAJI-01');
  const [ldrLux, setLdrLux] = useState<number>(4.2); // Low lux default (< 15 triggers hazard)
  const [cellularDbm, setCellularDbm] = useState<number>(-85); // dBm
  const [batteryPct, setBatteryPct] = useState<number>(88);
  const [motionDetected, setMotionDetected] = useState(true);
  const [lastTransmission, setLastTransmission] = useState<string | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);

  // Dynamic hazard detection logic based on sensor thresholds
  const isLightOutage = ldrLux < 15;
  const isCellularDeadZone = cellularDbm < -105;

  let inferredHazardType: HazardType = 'Unlit Street';
  if (isCellularDeadZone && !isLightOutage) {
    inferredHazardType = 'Cellular Dead Zone';
  } else if (isLightOutage) {
    inferredHazardType = 'Unlit Street';
  } else {
    inferredHazardType = 'Isolated Stretch';
  }

  const handleTransmit = () => {
    soundFx.playWaypointPing();
    setIsTransmitting(true);

    const eventId = `iot-ev-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();

    const newIoTEvent: IoTEventDoc = {
      iotEventId: eventId,
      deviceId,
      hazardType: inferredHazardType,
      location: {
        type: 'Point',
        coordinates: [
          Number((currentMapCenter.lng + (Math.random() * 0.004 - 0.002)).toFixed(6)),
          Number((currentMapCenter.lat + (Math.random() * 0.004 - 0.002)).toFixed(6)),
        ],
      },
      confidence: isLightOutage ? 95 : 88,
      sensorReadings: {
        ldrLux,
        cellularDbm,
        batteryPct,
        motionDetected,
        gpsSatellites: 8,
      },
      receivedAt: nowIso,
    };

    const newHazard: Omit<HazardDoc, 'hazardId' | 'createdAt' | 'upvotes'> = {
      type: inferredHazardType,
      severity: isLightOutage || isCellularDeadZone ? 'High' : 'Medium',
      description: `Automated Edge IoT Detection via ${deviceId}. LDR Sensor: ${ldrLux.toFixed(1)} Lux. SIM800L Signal: ${cellularDbm} dBm.`,
      location: newIoTEvent.location,
      status: 'Pending', // Enters admin review queue
      source: 'IoT',
      iotEventId: eventId,
      address: `Sector Sensor Range (${newIoTEvent.location.coordinates[1].toFixed(4)}°N, ${newIoTEvent.location.coordinates[0].toFixed(4)}°E)`,
    };

    setTimeout(() => {
      onTransmitIoTEvent(newIoTEvent, newHazard);
      setIsTransmitting(false);
      setLastTransmission(nowIso);
    }, 400);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] text-slate-200 overflow-y-auto p-4 space-y-4">
      {/* Hardware Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
            <Cpu size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-bold text-white tracking-wide">
                ESP32 EDGE IOT MICROCONTROLLER SIMULATOR
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-telemetry bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE (SIM800L GPRS)
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono-telemetry">
              Hardware Architecture: ESP32 SoC + LDR Photocell + SIM800L GSM + NEO-6M GPS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-telemetry text-slate-400">
          <Battery size={14} className="text-emerald-400" />
          <span>Battery: <strong className="text-white">{batteryPct}%</strong></span>
        </div>
      </div>

      {/* Main Hardware Tuning Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sensor 1: LDR Light Sensor */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb size={18} className={isLightOutage ? 'text-amber-400 animate-pulse' : 'text-slate-400'} />
              <span className="text-xs font-bold text-white font-mono-telemetry uppercase">
                LDR Ambient Photometric Sensor
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono-telemetry font-bold ${
              isLightOutage ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
            }`}>
              {isLightOutage ? 'HAZARD: UNLIT STREET (< 15 LUX)' : 'OPTIMAL ILLUMINATION'}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono-telemetry mb-1">
              <span className="text-slate-400">Current Light Level:</span>
              <span className="font-bold text-amber-300">{ldrLux.toFixed(1)} Lux</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={ldrLux}
              onChange={(e) => setLdrLux(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono-telemetry text-slate-500 mt-1">
              <span>0 Lux (Pitch Dark)</span>
              <span className="text-amber-400">Threshold: 15 Lux</span>
              <span>100 Lux (Bright)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Measures photometric lux along street segments. Readings under 15 Lux indicate municipal lamp burnout, trigger automated packet dispatch.
          </p>
        </div>

        {/* Sensor 2: SIM800L Cellular Signal Meter */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={18} className={isCellularDeadZone ? 'text-rose-400 animate-pulse' : 'text-cyan-400'} />
              <span className="text-xs font-bold text-white font-mono-telemetry uppercase">
                SIM800L GSM Signal Quality
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono-telemetry font-bold ${
              isCellularDeadZone ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-300'
            }`}>
              {isCellularDeadZone ? 'HAZARD: DEAD ZONE (< -105 dBm)' : 'GSM CARRIER CONNECTED'}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono-telemetry mb-1">
              <span className="text-slate-400">Signal Strength (RSSI):</span>
              <span className="font-bold text-cyan-300">{cellularDbm} dBm</span>
            </div>
            <input
              type="range"
              min="-120"
              max="-50"
              step="1"
              value={cellularDbm}
              onChange={(e) => setCellularDbm(parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono-telemetry text-slate-500 mt-1">
              <span>-120 dBm (No Signal)</span>
              <span className="text-rose-400">Threshold: -105 dBm</span>
              <span>-50 dBm (Strong)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Identifies sudden signal attenuation (underpasses, isolated canyons). Crucial for alerting pedestrians who might lose SOS connectivity.
          </p>
        </div>
      </div>

      {/* Packet Preview & Transmit Action */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono-telemetry text-slate-300 font-bold">
            <Terminal size={14} className="text-emerald-400" />
            <span>M2M TELEMETRY PACKET DISPATCH (POST /api/iot/hazard)</span>
          </div>
          {lastTransmission && (
            <span className="text-[10px] font-mono-telemetry text-slate-400">
              Last transmitted: {new Date(lastTransmission).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Live Packet JSON Preview */}
        <pre className="p-3 rounded-lg bg-[#0b0f17] border border-slate-800 text-[11px] font-mono-telemetry text-cyan-300 overflow-x-auto">
{`POST /api/iot/hazard HTTP/1.1
Host: saferoute-api.internal
Content-Type: application/json

{
  "deviceId": "${deviceId}",
  "hazardType": "${inferredHazardType}",
  "location": {
    "type": "Point",
    "coordinates": [${currentMapCenter.lng.toFixed(5)}, ${currentMapCenter.lat.toFixed(5)}]
  },
  "readings": {
    "ldrLux": ${ldrLux.toFixed(1)},
    "cellularDbm": ${cellularDbm},
    "motionDetected": ${motionDetected},
    "batteryPct": ${batteryPct}
  },
  "confidenceScore": ${isLightOutage ? 95 : 88}
}`}
        </pre>

        <button
          onClick={handleTransmit}
          disabled={isTransmitting}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isTransmitting ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              <span>TRANSMITTING TELEMETRY TO INGESTION QUEUE...</span>
            </>
          ) : (
            <>
              <Send size={15} />
              <span>TRANSMIT IOT PACKET TO SAFE-ROUTE GATEWAY</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
