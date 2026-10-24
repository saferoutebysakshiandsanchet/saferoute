import { 
  UserDoc, 
  AdminDoc, 
  IoTEventDoc, 
  HazardDoc, 
  HazardVerificationDoc, 
  SafeRoutePlan 
} from '../types/saferoute';

export const INITIAL_USERS: UserDoc[] = [
  {
    userId: 'usr-101',
    name: 'Priya Sharma',
    email: 'priya.sharma@campus.edu',
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    role: 'citizen',
    createdAt: '2026-08-15T10:30:00Z',
  },
  {
    userId: 'usr-102',
    name: 'Inspector R. Deshmukh',
    email: 'admin.moderation@saferoute.org',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    role: 'admin',
    createdAt: '2026-07-01T08:00:00Z',
  },
  {
    userId: 'usr-103',
    name: 'Aarav Patel',
    email: 'aarav.p@techcomm.in',
    passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    role: 'citizen',
    createdAt: '2026-09-10T14:15:00Z',
  },
];

export const INITIAL_ADMINS: AdminDoc[] = [
  {
    adminId: 'adm-01',
    userId: 'usr-102',
    badgeNumber: 'SR-MOD-8402',
    department: 'Municipal Safety & Vigilance Cell',
    createdAt: '2026-07-01T08:00:00Z',
  },
];

export const INITIAL_IOT_EVENTS: IoTEventDoc[] = [
  {
    iotEventId: 'iot-ev-901',
    deviceId: 'ESP32-NODE-SHIVAJI-01',
    hazardType: 'Unlit Street',
    location: {
      type: 'Point',
      coordinates: [73.8488, 18.5284], // [lng, lat]
    },
    confidence: 96,
    sensorReadings: {
      ldrLux: 3.8, // extremely dark (< 15 triggers hazard)
      cellularDbm: -82,
      batteryPct: 91,
      motionDetected: true,
      gpsSatellites: 9,
    },
    receivedAt: '2026-10-24T06:14:22Z',
  },
  {
    iotEventId: 'iot-ev-902',
    deviceId: 'ESP32-NODE-COLLEGE-04',
    hazardType: 'Cellular Dead Zone',
    location: {
      type: 'Point',
      coordinates: [73.8425, 18.5312],
    },
    confidence: 88,
    sensorReadings: {
      ldrLux: 45.0,
      cellularDbm: -116, // severe dead zone (< -105 dBm)
      batteryPct: 78,
      motionDetected: false,
      gpsSatellites: 7,
    },
    receivedAt: '2026-10-24T05:48:10Z',
  },
];

export const INITIAL_HAZARDS: HazardDoc[] = [
  {
    hazardId: 'haz-001',
    type: 'Unlit Street',
    severity: 'High',
    description: '3 municipal sodium lamps fused. Total darkness for 150m between Library Lane and Park turn.',
    location: {
      type: 'Point',
      coordinates: [73.8488, 18.5284],
    },
    status: 'Verified',
    source: 'IoT',
    iotEventId: 'iot-ev-901',
    createdAt: '2026-10-24T06:15:00Z',
    upvotes: 24,
    address: 'Library Lane, Shivaji Nagar',
  },
  {
    hazardId: 'haz-002',
    type: 'Stray Animal Cluster',
    severity: 'Medium',
    description: 'Pack of 6 aggressive stray dogs territorial around municipal garbage dumpster after 9 PM.',
    location: {
      type: 'Point',
      coordinates: [73.8542, 18.5235],
    },
    status: 'Verified',
    source: 'User',
    userId: 'usr-101',
    userName: 'Priya Sharma',
    createdAt: '2026-10-23T21:40:00Z',
    upvotes: 18,
    address: 'Near Old Bus Stand Gate 2',
  },
  {
    hazardId: 'haz-003',
    type: 'Isolated Stretch',
    severity: 'High',
    description: 'Overgrown bushes and closed warehouse boundary. Very minimal pedestrian traffic after dark.',
    location: {
      type: 'Point',
      coordinates: [73.8465, 18.5210],
    },
    status: 'Verified',
    source: 'User',
    userId: 'usr-103',
    userName: 'Aarav Patel',
    createdAt: '2026-10-23T20:12:00Z',
    upvotes: 31,
    address: 'Behind Industrial Warehouse Yard',
  },
  {
    hazardId: 'haz-004',
    type: 'Cellular Dead Zone',
    severity: 'Medium',
    description: 'Zero GSM/LTE signal connectivity under the underpass. Emergency calls fail to connect.',
    location: {
      type: 'Point',
      coordinates: [73.8425, 18.5312],
    },
    status: 'Pending', // Awaiting Admin Moderation!
    source: 'IoT',
    iotEventId: 'iot-ev-902',
    createdAt: '2026-10-24T05:49:00Z',
    upvotes: 4,
    address: 'Railway Underpass Passway',
  },
  {
    hazardId: 'haz-005',
    type: 'Harassment Hotspot',
    severity: 'High',
    description: 'Unregulated alcohol consumption and catcalling reported near the unlit park fountain.',
    location: {
      type: 'Point',
      coordinates: [73.8510, 18.5260],
    },
    status: 'Pending', // Awaiting Admin Moderation!
    source: 'User',
    userId: 'usr-101',
    userName: 'Priya Sharma',
    createdAt: '2026-10-24T06:30:00Z',
    upvotes: 9,
    address: 'North Corner of City Garden',
  },
  {
    hazardId: 'haz-007',
    type: 'Unlit Street',
    severity: 'High',
    description: 'Blacked out corner opposite municipal library. Complete zero-lumen stretch.',
    location: {
      type: 'Point',
      coordinates: [73.8492, 18.5289],
    },
    status: 'Verified',
    source: 'IoT',
    createdAt: '2026-10-24T06:22:00Z',
    upvotes: 14,
    address: 'Library Lane North Bend',
  },
  {
    hazardId: 'haz-008',
    type: 'Unlit Street',
    severity: 'High',
    description: 'Broken lamp fixture sparking, left unrepaired for 2 weeks.',
    location: {
      type: 'Point',
      coordinates: [73.8481, 18.5280],
    },
    status: 'Verified',
    source: 'User',
    createdAt: '2026-10-24T05:50:00Z',
    upvotes: 21,
    address: 'Library Lane Service Gate',
  },
  {
    hazardId: 'haz-009',
    type: 'Stray Animal Cluster',
    severity: 'High',
    description: 'Territorial dogs chasing two-wheelers and pedestrians crossing Old Bus Stand.',
    location: {
      type: 'Point',
      coordinates: [73.8548, 18.5231],
    },
    status: 'Verified',
    source: 'User',
    createdAt: '2026-10-24T04:10:00Z',
    upvotes: 27,
    address: 'Old Bus Stand South Exit',
  },
  {
    hazardId: 'haz-010',
    type: 'Stray Animal Cluster',
    severity: 'Medium',
    description: 'Pack of 4 stray dogs frequenting meat market refuse bin after 8:30 PM.',
    location: {
      type: 'Point',
      coordinates: [73.8538, 18.5240],
    },
    status: 'Verified',
    source: 'User',
    createdAt: '2026-10-23T22:15:00Z',
    upvotes: 12,
    address: 'Bus Stand West Lane',
  },
  {
    hazardId: 'haz-011',
    type: 'Cellular Dead Zone',
    severity: 'High',
    description: 'Underpass culvert drops all GSM/4G/5G signals completely.',
    location: {
      type: 'Point',
      coordinates: [73.8421, 18.5308],
    },
    status: 'Verified',
    source: 'IoT',
    createdAt: '2026-10-24T05:12:00Z',
    upvotes: 16,
    address: 'Railway Underpass Pedestrian Tunnel',
  },
  {
    hazardId: 'haz-012',
    type: 'Isolated Stretch',
    severity: 'High',
    description: 'Blind corner behind empty godown with zero street illumination or cameras.',
    location: {
      type: 'Point',
      coordinates: [73.8458, 18.5204],
    },
    status: 'Verified',
    source: 'User',
    createdAt: '2026-10-24T01:30:00Z',
    upvotes: 22,
    address: 'Warehouse South Boundary Path',
  },
  {
    hazardId: 'haz-006',
    type: 'Flooded / Blocked Path',
    severity: 'Low',
    description: 'Open trench dug for fiber cable laying without caution tape or warning blinkers.',
    location: {
      type: 'Point',
      coordinates: [73.8560, 18.5290],
    },
    status: 'Rejected',
    source: 'User',
    userId: 'usr-103',
    userName: 'Aarav Patel',
    createdAt: '2026-10-22T14:00:00Z',
    upvotes: 1,
    address: 'East Avenue Cross 4',
    rejectionRemarks: 'Resolved by municipal road department on 23rd Oct. Trench filled and paved.',
  },
];

export const INITIAL_VERIFICATIONS: HazardVerificationDoc[] = [
  {
    verificationId: 'v-001',
    hazardId: 'haz-001',
    hazardTitle: 'Library Lane Light Outage',
    hazardType: 'Unlit Street',
    adminId: 'adm-01',
    adminName: 'Inspector R. Deshmukh',
    action: 'Approved',
    remarks: 'Cross-verified with IoT ESP32 Lux sensor reading (3.8 Lux). Dispatched notification to Muncipal Works.',
    verifiedAt: '2026-10-24T06:20:14Z',
  },
  {
    verificationId: 'v-002',
    hazardId: 'haz-002',
    hazardTitle: 'Stray Dog Pack',
    hazardType: 'Stray Animal Cluster',
    adminId: 'adm-01',
    adminName: 'Inspector R. Deshmukh',
    action: 'Approved',
    remarks: 'Multiple citizen reports received. Animal control unit informed for humane relocation.',
    verifiedAt: '2026-10-23T22:05:00Z',
  },
  {
    verificationId: 'v-003',
    hazardId: 'haz-006',
    hazardTitle: 'Trench Digging',
    hazardType: 'Flooded / Blocked Path',
    adminId: 'adm-01',
    adminName: 'Inspector R. Deshmukh',
    action: 'Rejected',
    remarks: 'Road works concluded and hazard is cleared.',
    verifiedAt: '2026-10-23T11:30:00Z',
  },
];

// Coordinate routes centered in Pune Deccan / Shivaji Nagar
export const INITIAL_SAFE_ROUTE: SafeRoutePlan = {
  id: 'safe',
  name: 'SafeRoute Shield Corridor (Recommended)',
  tagline: 'Maintains 100% illuminated streets, avoids stray animal pack & unlit library alley',
  safetyScore: 94,
  durationMinutes: 14,
  distanceKm: 1.1,
  hazardsAvoided: 3,
  coordinates: [
    [18.5204, 73.8567], // Origin: Deccan Gymkhana
    [18.5225, 73.8530], // Along FC Road (Well-lit commercial spine)
    [18.5255, 73.8510], // Near Police Assistance Booth
    [18.5290, 73.8465], // High-illumination corridor
    [18.5320, 73.8440], // Destination: College Main Gate
  ],
  waypoints: [
    {
      instruction: 'Start at Deccan Gymkhana Crossing',
      street: 'FC Road Main Commercial Spine',
      safeNote: 'Active foot traffic, 24/7 stores, continuous LED street lighting (88 Lux)',
    },
    {
      instruction: 'Continue north along FC Road past Police Assistance Booth',
      street: 'Fergusson College Road',
      safeNote: 'CCTV covered, avoids unlit alleyway on right',
    },
    {
      instruction: 'Take wide illuminated avenue left toward University Annexe',
      street: 'Gokhale Boulevard',
      safeNote: 'Steers 220m away from reported Stray Animal Cluster',
    },
    {
      instruction: 'Arrive safely at College Main Gate Safe Haven',
      street: 'Campus Main Entrance',
      safeNote: 'Security guards on duty 24/7',
    },
  ],
};

export const INITIAL_SHORTEST_ROUTE: SafeRoutePlan = {
  id: 'shortest',
  name: 'Shortest Raw Route (High Risk)',
  tagline: 'Direct shortcut via unlit service alleys & known animal territory',
  safetyScore: 42,
  durationMinutes: 10,
  distanceKm: 0.8,
  hazardsAvoided: 0,
  coordinates: [
    [18.5204, 73.8567],
    [18.5235, 73.8542], // Directly intersects Stray Animal Cluster (haz-002)
    [18.5284, 73.8488], // Directly intersects Unlit Street (haz-001)
    [18.5320, 73.8440],
  ],
  waypoints: [
    {
      instruction: 'Cut through rear alley towards Bus Stand',
      street: 'Old Bus Stand Alley',
      hazardWarning: '⚠️ WARNING: Stray dog cluster reported at dumpster. High bite risk after 9 PM.',
    },
    {
      instruction: 'Proceed down dark unlit passage',
      street: 'Library Lane Outage Zone',
      hazardWarning: '⚠️ CRITICAL: 3 fused lights, complete darkness for 150m. ESP32 Lux < 4.',
    },
  ],
};
