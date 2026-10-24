import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Radio, 
  Crosshair, 
  Plus, 
  Minus, 
  Eye, 
  Building2, 
  MapPin, 
  Navigation,
  Compass,
  Zap,
  Lightbulb
} from 'lucide-react';
import { HazardIncident, SafeHaven, SafeRouteOption, SeverityTier } from '../types/sentinel';
import { soundFx } from '../utils/sound';

interface TacticalMapProps {
  incidents: HazardIncident[];
  safeHavens: SafeHaven[];
  selectedIncident: HazardIncident | null;
  onSelectIncident: (inc: HazardIncident | null) => void;
  selectedSafeHaven: SafeHaven | null;
  onSelectSafeHaven: (sh: SafeHaven | null) => void;
  activeRoute: SafeRouteOption | null;
  isNavigating: boolean;
  userPosition: { x: number; y: number; heading: number };
  onMapClick?: (x: number, y: number) => void;
  showRadarSweep: boolean;
  showLightingHeat: boolean;
  showCCTVCoverage: boolean;
  emergencyActive: boolean;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  incidents,
  safeHavens,
  selectedIncident,
  onSelectIncident,
  selectedSafeHaven,
  onSelectSafeHaven,
  activeRoute,
  isNavigating,
  userPosition,
  showRadarSweep,
  showLightingHeat,
  showCCTVCoverage,
  emergencyActive,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Radar pulse audio trigger intermittently if enabled
  useEffect(() => {
    if (!showRadarSweep) return;
    const interval = setInterval(() => {
      soundFx.playRadarBlip();
    }, 12000);
    return () => clearInterval(interval);
  }, [showRadarSweep]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Left click drag
    if (e.button === 0) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetView = useCallback(() => {
    soundFx.playClick();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const zoomIn = () => {
    soundFx.playClick();
    setZoom((z) => Math.min(z + 0.25, 2.2));
  };

  const zoomOut = () => {
    soundFx.playClick();
    setZoom((z) => Math.max(z - 0.25, 0.75));
  };

  const getSeverityColor = (tier: SeverityTier) => {
    switch (tier) {
      case 'high':
        return '#ef4444'; // Crimson
      case 'elevated':
        return '#f97316'; // Tangerine
      case 'caution':
        return '#eab308'; // Amber
      case 'safe':
        return '#10b981'; // Emerald
    }
  };

  // SVG coordinate transformation helper
  const toSvgX = (pct: number) => pct * 10;
  const toSvgY = (pct: number) => pct * 10;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden bg-[#0b0f17] ${
        emergencyActive ? 'ring-4 ring-inset ring-red-500/80 animate-pulse' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Tactical Grid Background & Street Canvas */}
      <div 
        className="absolute inset-0 transition-transform duration-100 ease-out will-change-transform"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full min-w-[700px] min-h-[700px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Tactical Grid Pattern */}
            <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#182030" strokeWidth="0.8" strokeOpacity="0.7" />
              <circle cx="0" cy="0" r="1" fill="#334155" />
            </pattern>

            <pattern id="subGrid" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#26354a" strokeWidth="1.2" strokeOpacity="0.85" />
            </pattern>

            {/* Street Light Glow Filter */}
            <filter id="streetGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Neon Safe Route Path Glow */}
            <filter id="neonRouteGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feColorMatrix 
                type="matrix" 
                values="1 0 0 0 0.96   0 1 0 0 0.62   0 0 1 0 0.04   0 0 0 1 0" 
                result="coloredBlur"
              />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Radar Conical Gradient */}
            <radialGradient id="radarPulseGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background ground zero */}
          <rect width="1000" height="1000" fill="#0b0f17" />
          <rect width="1000" height="1000" fill="url(#tacticalGrid)" />
          <rect width="1000" height="1000" fill="url(#subGrid)" />

          {/* City Urban Blocks & Buildings (Dark Slate Geometry) */}
          <g opacity="0.9">
            {/* Block 1 */}
            <rect x="80" y="80" width="180" height="180" rx="8" fill="#131926" stroke="#1e293b" strokeWidth="1.5" />
            <text x="100" y="110" fill="#475569" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="0.05em">DISTRICT 04 / SEC-A</text>
            
            {/* Block 2 */}
            <rect x="300" y="80" width="220" height="180" rx="8" fill="#121824" stroke="#1e293b" strokeWidth="1.5" />
            <text x="320" y="110" fill="#475569" fontSize="11" fontFamily="JetBrains Mono">TECH PLAZA BARKER</text>

            {/* Block 3 */}
            <rect x="560" y="80" width="360" height="180" rx="8" fill="#131926" stroke="#1e293b" strokeWidth="1.5" />
            <text x="580" y="110" fill="#475569" fontSize="11" fontFamily="JetBrains Mono">NORTH RETAIL CONCOURSE</text>

            {/* Block 4 */}
            <rect x="80" y="300" width="180" height="320" rx="8" fill="#111722" stroke="#1e293b" strokeWidth="1.5" />
            <text x="96" y="330" fill="#475569" fontSize="11" fontFamily="JetBrains Mono">CIVIC PATROL YARD</text>

            {/* Block 5 - Central Sector */}
            <rect x="300" y="300" width="220" height="140" rx="8" fill="#151d2c" stroke="#253349" strokeWidth="1.5" />
            <text x="320" y="326" fill="#64748b" fontSize="11" fontFamily="JetBrains Mono">METRO TRANSIT LOWER PARK</text>

            {/* Block 6 - Dark Service Alleyway Zone */}
            <rect x="560" y="300" width="180" height="140" rx="8" fill="#0f1420" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            <text x="575" y="325" fill="#f87171" fontSize="10" fontFamily="JetBrains Mono" opacity="0.8">⚠️ UNLIT REAR ACCESS</text>

            {/* Block 7 */}
            <rect x="780" y="300" width="140" height="320" rx="8" fill="#131926" stroke="#1e293b" strokeWidth="1.5" />
            <text x="795" y="330" fill="#475569" fontSize="11" fontFamily="JetBrains Mono">MEDICAL CENTER HUB</text>

            {/* Block 8 */}
            <rect x="300" y="480" width="220" height="140" rx="8" fill="#141c2a" stroke="#1e293b" strokeWidth="1.5" />
            <text x="320" y="506" fill="#475569" fontSize="11" fontFamily="JetBrains Mono">CIVIC AUDITORIUM</text>

            {/* Block 9 */}
            <rect x="560" y="480" width="180" height="140" rx="8" fill="#121824" stroke="#1e293b" strokeWidth="1.5" />
            <text x="575" y="506" fill="#475569" fontSize="11" fontFamily="JetBrains Mono">COMMERCIAL ARCADE</text>

            {/* Lower Blocks */}
            <rect x="80" y="660" width="280" height="260" rx="8" fill="#131926" stroke="#1e293b" strokeWidth="1.5" />
            <text x="100" y="690" fill="#475569" fontSize="11" fontFamily="JetBrains Mono">RESIDENTIAL QUAD</text>

            <rect x="400" y="660" width="320" height="260" rx="8" fill="#131926" stroke="#1e293b" strokeWidth="1.5" />
            <text x="420" y="690" fill="#475569" fontSize="11" fontFamily="JetBrains Mono">COMMUNITY CENTER</text>

            <rect x="760" y="660" width="160" height="260" rx="8" fill="#111722" stroke="#1e293b" strokeWidth="1.5" />
            <text x="780" y="690" fill="#475569" fontSize="11" fontFamily="JetBrains Mono">EAST SUBWAY GATE</text>
          </g>

          {/* Road Network & Corridors */}
          <g>
            {/* Horizontal Avenues */}
            {/* Geary Blvd */}
            <line x1="0" y1="280" x2="1000" y2="280" stroke="#1e293b" strokeWidth="26" strokeLinecap="round" />
            <line x1="0" y1="280" x2="1000" y2="280" stroke="#334155" strokeWidth="1.5" strokeDasharray="14 10" />
            <text x="40" y="275" fill="#64748b" fontSize="12" fontFamily="Plus Jakarta Sans" fontWeight="700">PINE STREET CORRIDOR</text>

            {/* Market St (Angled Main Artery) */}
            <line x1="40" y1="840" x2="960" y2="220" stroke="#24334a" strokeWidth="36" strokeLinecap="round" />
            <line x1="40" y1="840" x2="960" y2="220" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="20 12" />
            <text x="160" y="780" fill="#ffc174" fontSize="13" fontFamily="Plus Jakarta Sans" fontWeight="800" transform="rotate(-34 160 780)">
              MARKET STREET (SENTINEL MONITORED)
            </text>

            {/* Mission Blvd */}
            <line x1="0" y1="460" x2="1000" y2="460" stroke="#1e293b" strokeWidth="24" />
            <line x1="0" y1="460" x2="1000" y2="460" stroke="#334155" strokeWidth="1.5" strokeDasharray="12 8" />
            <text x="40" y="454" fill="#64748b" fontSize="12" fontFamily="Plus Jakarta Sans" fontWeight="700">MISSION BOULEVARD</text>

            {/* Howard St */}
            <line x1="0" y1="640" x2="1000" y2="640" stroke="#1e293b" strokeWidth="22" />
            <text x="40" y="635" fill="#64748b" fontSize="11" fontFamily="Plus Jakarta Sans">HOWARD AVENUE</text>

            {/* Vertical Streets */}
            {/* 4th Street */}
            <line x1="280" y1="0" x2="280" y2="1000" stroke="#1e293b" strokeWidth="24" />
            <line x1="280" y1="0" x2="280" y2="1000" stroke="#334155" strokeWidth="1.5" strokeDasharray="12 8" />
            <text x="268" y="940" fill="#64748b" fontSize="11" fontFamily="Plus Jakarta Sans" transform="rotate(-90 268 940)">4TH STREET</text>

            {/* 5th Street */}
            <line x1="540" y1="0" x2="540" y2="1000" stroke="#1e293b" strokeWidth="24" />
            <line x1="540" y1="0" x2="540" y2="1000" stroke="#334155" strokeWidth="1.5" strokeDasharray="12 8" />
            <text x="528" y="940" fill="#64748b" fontSize="11" fontFamily="Plus Jakarta Sans" transform="rotate(-90 528 940)">5TH STREET</text>

            {/* 6th Street */}
            <line x1="750" y1="0" x2="750" y2="1000" stroke="#1e293b" strokeWidth="20" />
            <text x="738" y="940" fill="#64748b" fontSize="11" fontFamily="Plus Jakarta Sans" transform="rotate(-90 738 940)">6TH STREET</text>

            {/* Unlit Dark Alleyway */}
            <path d="M 540 440 L 680 440 L 680 350" fill="none" stroke="#b91c1c" strokeWidth="10" strokeDasharray="4 6" opacity="0.6" />
          </g>

          {/* Optional Street Lighting Lux Heat Overlay */}
          {showLightingHeat && (
            <g opacity="0.45" filter="url(#streetGlow)">
              {/* High Lux along Market St and 4th */}
              <circle cx="480" cy="620" r="140" fill="#f59e0b" opacity="0.25" />
              <circle cx="300" cy="780" r="110" fill="#f59e0b" opacity="0.3" />
              <circle cx="460" cy="520" r="120" fill="#f59e0b" opacity="0.28" />
              <circle cx="680" cy="350" r="130" fill="#f59e0b" opacity="0.35" />
              {/* Red low-light deficit alert spot */}
              <circle cx="540" cy="440" r="70" fill="#ef4444" opacity="0.3" />
            </g>
          )}

          {/* Optional Municipal CCTV Dots */}
          {showCCTVCoverage && (
            <g>
              {[
                { x: 300, y: 780 },
                { x: 360, y: 750 },
                { x: 420, y: 700 },
                { x: 480, y: 620 },
                { x: 460, y: 520 },
                { x: 550, y: 380 },
                { x: 680, y: 350 },
                { x: 280, y: 380 },
                { x: 740, y: 720 },
              ].map((cctv, i) => (
                <g key={`cctv-${i}`} transform={`translate(${cctv.x}, ${cctv.y})`}>
                  <circle r="12" fill="#8b5cf6" fillOpacity="0.15" stroke="#8b5cf6" strokeWidth="0.8" />
                  <circle r="3" fill="#d5c3ff" />
                </g>
              ))}
            </g>
          )}

          {/* Active Safe Route Polyline */}
          {activeRoute && (
            <g>
              {activeRoute.id === 'safe' ? (
                <>
                  {/* Glowing halo */}
                  <path
                    d={`M ${activeRoute.points.map((p) => `${toSvgX(p.x)} ${toSvgY(p.y)}`).join(' L ')}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.35"
                    filter="url(#neonRouteGlow)"
                  />
                  {/* Main solid neon spine */}
                  <path
                    d={`M ${activeRoute.points.map((p) => `${toSvgX(p.x)} ${toSvgY(p.y)}`).join(' L ')}`}
                    fill="none"
                    stroke="#ffc174"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Directional animated dashes */}
                  <path
                    d={`M ${activeRoute.points.map((p) => `${toSvgX(p.x)} ${toSvgY(p.y)}`).join(' L ')}`}
                    fill="none"
                    stroke="#0b0f17"
                    strokeWidth="2"
                    strokeDasharray="6 8"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <>
                  {/* Direct Unshielded Caution Route */}
                  <path
                    d={`M ${activeRoute.points.map((p) => `${toSvgX(p.x)} ${toSvgY(p.y)}`).join(' L ')}`}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="4"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Waypoints along route */}
              {activeRoute.steps.map((step, idx) => (
                <g key={step.id} transform={`translate(${toSvgX(step.x)}, ${toSvgY(step.y)})`}>
                  <circle r="10" fill="#111827" stroke="#f59e0b" strokeWidth="2.5" />
                  <circle r="4" fill="#f59e0b" />
                  <text
                    x="15"
                    y="4"
                    fill="#f8fafc"
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                    fontWeight="700"
                  >
                    W{idx + 1}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Safe-Haven Hubs Layer */}
          <g>
            {safeHavens.map((haven) => {
              const isSelected = selectedSafeHaven?.id === haven.id;
              const hx = toSvgX(haven.x);
              const hy = toSvgY(haven.y);

              return (
                <g
                  key={haven.id}
                  transform={`translate(${hx}, ${hy})`}
                  className="cursor-pointer transition-transform duration-200 hover:scale-125"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playClick();
                    onSelectIncident(null);
                    onSelectSafeHaven(haven);
                  }}
                >
                  {/* Teal radar ping ring */}
                  <circle r="28" fill="#06b6d4" fillOpacity="0.12" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" />
                  <circle r="18" fill="#03b5d3" fillOpacity="0.25" stroke="#4cd7f6" strokeWidth="1.5" />
                  
                  {/* Center Hub Icon Badge */}
                  <circle r="12" fill={isSelected ? '#06b6d4' : '#111827'} stroke="#4cd7f6" strokeWidth="2" />
                  
                  {/* Shield graphic */}
                  <path 
                    d="M -5 -4 L 0 -7 L 5 -4 L 5 2 C 5 5 0 7 0 7 C 0 7 -5 5 -5 2 Z" 
                    fill={isSelected ? '#0b0f17' : '#4cd7f6'} 
                  />

                  {/* Monospace Label Badge */}
                  <rect x="-40" y="20" width="80" height="18" rx="9" fill="#0f172a" fillOpacity="0.9" stroke="#06b6d4" strokeWidth="0.8" />
                  <text
                    x="0"
                    y="32"
                    textAnchor="middle"
                    fill="#acedff"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="600"
                  >
                    SAFE HAVEN
                  </text>
                </g>
              );
            })}
          </g>

          {/* Hazard Incidents Layer */}
          <g>
            {incidents.map((incident) => {
              const isSelected = selectedIncident?.id === incident.id;
              const ix = toSvgX(incident.x);
              const iy = toSvgY(incident.y);
              const color = getSeverityColor(incident.severity);

              return (
                <g
                  key={incident.id}
                  transform={`translate(${ix}, ${iy})`}
                  className="cursor-pointer transition-transform duration-200 hover:scale-125"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playClick();
                    onSelectSafeHaven(null);
                    onSelectIncident(incident);
                  }}
                >
                  {/* Pulsing ring for active hazards */}
                  <circle
                    r="24"
                    fill={color}
                    fillOpacity="0.2"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeDasharray={incident.severity === 'high' ? '2 2' : undefined}
                  />

                  {/* Core marker badge */}
                  <circle
                    r="14"
                    fill={isSelected ? color : '#1e293b'}
                    stroke={color}
                    strokeWidth="2.5"
                  />

                  {/* Exclamation or check */}
                  {incident.severity === 'safe' ? (
                    <path
                      d="M -4 0 L -1 3 L 4 -2"
                      fill="none"
                      stroke={isSelected ? '#0b0f17' : '#10b981'}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  ) : (
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isSelected ? '#0b0f17' : color}
                      fontSize="12"
                      fontFamily="JetBrains Mono"
                      fontWeight="800"
                    >
                      !
                    </text>
                  )}

                  {/* Floating Chip with Monospace time ago */}
                  <rect
                    x="-45"
                    y="-30"
                    width="90"
                    height="18"
                    rx="9"
                    fill="#111827"
                    fillOpacity="0.95"
                    stroke={color}
                    strokeWidth="1"
                  />
                  <circle cx="-34" cy="-21" r="3" fill={color} />
                  <text
                    x="2"
                    y="-18"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="600"
                  >
                    {incident.timeAgoMinutes}m AGO
                  </text>
                </g>
              );
            })}
          </g>

          {/* User Live GPS Marker & Pedestrian Radar Pulses */}
          <g transform={`translate(${toSvgX(userPosition.x)}, ${toSvgY(userPosition.y)})`}>
            {/* Radar conical sweep */}
            {showRadarSweep && (
              <g className="animate-radar-sweep">
                <path
                  d="M 0 0 L 160 -80 A 180 180 0 0 1 180 0 Z"
                  fill="url(#radarPulseGrad)"
                />
              </g>
            )}

            {/* Concentric GPS rings */}
            <circle r="44" fill="none" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 4" />
            <circle r="22" fill="#06b6d4" fillOpacity="0.15" stroke="#06b6d4" strokeWidth="1.5" />

            {/* Heading Cone */}
            <g transform={`rotate(${userPosition.heading})`}>
              <polygon points="0,-18 7,6 0,2 -7,6" fill="#f59e0b" stroke="#0b0f17" strokeWidth="1" />
            </g>

            {/* Core blue beacon */}
            <circle r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />

            {/* User Pill Monospace Tag */}
            <rect x="-38" y="24" width="76" height="18" rx="9" fill="#0f172a" fillOpacity="0.95" stroke="#f59e0b" strokeWidth="1" />
            <text
              x="0"
              y="36"
              textAnchor="middle"
              fill="#ffc174"
              fontSize="9"
              fontFamily="JetBrains Mono"
              fontWeight="700"
            >
              YOU (LIVE)
            </text>
          </g>
        </svg>
      </div>

      {/* Map Control HUD (Floating Top Right Tactical Toolbar) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          title="Zoom In"
          className="w-10 h-10 rounded-md tactical-glass-1 flex items-center justify-center text-[#dfe2ee] hover:text-[#ffc174] hover:border-[#f59e0b] transition-all shadow-lg active:scale-95"
        >
          <Plus size={18} />
        </button>

        <button
          onClick={zoomOut}
          title="Zoom Out"
          className="w-10 h-10 rounded-md tactical-glass-1 flex items-center justify-center text-[#dfe2ee] hover:text-[#ffc174] hover:border-[#f59e0b] transition-all shadow-lg active:scale-95"
        >
          <Minus size={18} />
        </button>

        <button
          onClick={resetView}
          title="Recenter Map"
          className="w-10 h-10 rounded-md tactical-glass-1 flex items-center justify-center text-[#dfe2ee] hover:text-[#4cd7f6] hover:border-[#06b6d4] transition-all shadow-lg active:scale-95"
        >
          <Crosshair size={18} />
        </button>
      </div>

      {/* Floating Tactical Telemetry Watermark (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2 tactical-glass-1 px-3 py-1.5 rounded-md text-xs font-mono-telemetry border border-slate-700/60">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#f8fafc] font-semibold">GRID ONLINE</span>
          <span className="text-slate-500">|</span>
          <span className="text-[#4cd7f6]">37.7812°N 122.4140°W</span>
        </div>
      </div>
    </div>
  );
};
