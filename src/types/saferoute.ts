export type HazardType = 
  | 'Unlit Street' 
  | 'Isolated Stretch' 
  | 'Stray Animal Cluster' 
  | 'Cellular Dead Zone' 
  | 'Harassment Hotspot' 
  | 'Flooded / Blocked Path'
  | 'Severe Weather Alert'
  | 'Dense Fog / Low Visibility'
  | 'Waterlogging / Heavy Rain';

export type HazardSeverity = 'High' | 'Medium' | 'Low';

export type HazardStatus = 'Pending' | 'Verified' | 'Rejected';

export type HazardSource = 'User' | 'IoT' | 'Weather';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude] per GeoJSON standard
}

export interface UserDoc {
  userId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'citizen' | 'admin';
  createdAt: string;
}

export interface AdminDoc {
  adminId: string;
  userId: string;
  badgeNumber: string;
  department: string;
  createdAt: string;
}

export interface IoTEventDoc {
  iotEventId: string;
  deviceId: string;
  hazardType: HazardType;
  location: GeoPoint;
  confidence: number; // 0 - 100%
  sensorReadings: {
    ldrLux?: number;
    cellularDbm?: number;
    batteryPct?: number;
    motionDetected?: boolean;
    gpsSatellites?: number;
  };
  receivedAt: string;
}

export interface HazardDoc {
  hazardId: string;
  type: HazardType;
  severity: HazardSeverity;
  description: string;
  location: GeoPoint;
  status: HazardStatus;
  source: HazardSource;
  userId?: string;
  userName?: string;
  iotEventId?: string;
  createdAt: string;
  upvotes: number;
  address?: string;
  rejectionRemarks?: string;
}

export interface HazardVerificationDoc {
  verificationId: string;
  hazardId: string;
  hazardTitle: string;
  hazardType: HazardType;
  adminId: string;
  adminName: string;
  action: 'Approved' | 'Rejected';
  remarks: string;
  verifiedAt: string;
}

export interface SafeRoutePlan {
  id: 'safe' | 'shortest';
  name: string;
  tagline: string;
  safetyScore: number; // 0 - 100
  durationMinutes: number;
  distanceKm: number;
  hazardsAvoided: number;
  coordinates: [number, number][]; // [lat, lng] array for Leaflet polyline
  waypoints: {
    instruction: string;
    street: string;
    safeNote?: string;
    hazardWarning?: string;
  }[];
}

export interface LocationPoint {
  id: string;
  name: string;
  category: 'current' | 'transit' | 'campus' | 'commercial' | 'landmark' | 'custom';
  address: string;
  coordinates: [number, number]; // [lat, lng]
  isSafeHaven?: boolean;
  city?: string;
  state?: string;
}


