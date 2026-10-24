export type SeverityTier = 'high' | 'elevated' | 'caution' | 'safe';

export interface HazardIncident {
  id: string;
  title: string;
  description: string;
  severity: SeverityTier;
  category: 'lighting' | 'acoustic' | 'disturbance' | 'pathway' | 'cctv_blindspot' | 'emergency';
  lat: number;
  lng: number;
  x: number; // canvas percent [0..100]
  y: number; // canvas percent [0..100]
  timestamp: string;
  timeAgoMinutes: number;
  reportedBy: string;
  sourceConfidence: number; // 0 - 100
  supervisorVerified: boolean;
  stillHereCount: number;
  clearCount: number;
  acousticDecibels?: number;
  municipalId: string;
}

export interface SafeHaven {
  id: string;
  name: string;
  category: 'transit' | 'pharmacy' | 'police' | 'hospital' | 'business_partner';
  address: string;
  x: number; // canvas percent [0..100]
  y: number; // canvas percent [0..100]
  hours: string;
  is24Hours: boolean;
  staffPresent: boolean;
  cctvInstalled: boolean;
  phone: string;
  distanceMeters: number;
}

export interface Waypoint {
  id: string;
  instruction: string;
  streetName: string;
  x: number;
  y: number;
  lightingScore: number; // 0 - 100
  cctvCount: number;
  hasSafeHavenNearby?: string;
  status: 'passed' | 'current' | 'upcoming';
}

export interface SafeRouteOption {
  id: 'safe' | 'direct';
  name: string;
  tagline: string;
  etaMinutes: number;
  distanceKm: number;
  lightingRating: number; // %
  cctvCoverageCount: number;
  safeHavenCount: number;
  hazardRiskLevel: 'LOW' | 'HIGH';
  points: { x: number; y: number }[];
  steps: Waypoint[];
}

export interface TelemetryMetric {
  sensorId: string;
  type: 'acoustic' | 'luminance' | 'cctv' | 'density';
  label: string;
  status: 'optimal' | 'warning' | 'alert';
  value: string;
  unit: string;
  location: string;
  lastUpdated: string;
}
