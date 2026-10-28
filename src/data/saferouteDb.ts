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
  // Pune IoT Node
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
      ldrLux: 3.8,
      cellularDbm: -82,
      batteryPct: 91,
      motionDetected: true,
      gpsSatellites: 9,
    },
    receivedAt: '2026-10-24T06:14:22Z',
  },
  // Delhi NCR IoT Node
  {
    iotEventId: 'iot-ev-delhi-01',
    deviceId: 'ESP32-NODE-DELHI-CP-03',
    hazardType: 'Unlit Street',
    location: {
      type: 'Point',
      coordinates: [77.2140, 28.6350],
    },
    confidence: 94,
    sensorReadings: {
      ldrLux: 2.1,
      cellularDbm: -78,
      batteryPct: 88,
      motionDetected: true,
      gpsSatellites: 11,
    },
    receivedAt: '2026-10-26T20:10:00Z',
  },
  // Mumbai IoT Node
  {
    iotEventId: 'iot-ev-mum-01',
    deviceId: 'ESP32-NODE-MUM-BANDRA-02',
    hazardType: 'Cellular Dead Zone',
    location: {
      type: 'Point',
      coordinates: [72.8360, 19.0490],
    },
    confidence: 92,
    sensorReadings: {
      ldrLux: 52.0,
      cellularDbm: -118,
      batteryPct: 84,
      motionDetected: false,
      gpsSatellites: 8,
    },
    receivedAt: '2026-10-26T18:30:00Z',
  },
  // Bengaluru IoT Node
  {
    iotEventId: 'iot-ev-blr-01',
    deviceId: 'ESP32-NODE-BLR-KORA-05',
    hazardType: 'Unlit Street',
    location: {
      type: 'Point',
      coordinates: [77.6200, 12.9320],
    },
    confidence: 91,
    sensorReadings: {
      ldrLux: 4.5,
      cellularDbm: -85,
      batteryPct: 95,
      motionDetected: true,
      gpsSatellites: 10,
    },
    receivedAt: '2026-10-26T21:05:00Z',
  },
];

export const INITIAL_HAZARDS: HazardDoc[] = [
  // ==================== DELHI NCR ====================
  {
    hazardId: 'haz-delhi-001',
    type: 'Unlit Street',
    severity: 'High',
    description: '4 streetlights non-functional on radial alley between Outer Circle and Baba Kharak Singh Marg.',
    location: {
      type: 'Point',
      coordinates: [77.2140, 28.6350], // [lng, lat]
    },
    status: 'Verified',
    source: 'IoT',
    iotEventId: 'iot-ev-delhi-01',
    createdAt: '2026-10-26T20:12:00Z',
    upvotes: 38,
    address: 'Outer Circle Rear Alley, Connaught Place, New Delhi',
  },
  {
    hazardId: 'haz-delhi-002',
    type: 'Isolated Stretch',
    severity: 'High',
    description: 'Deserted pedestrian walkway behind Railway Colony with dense shrubbery and no CCTV coverage.',
    location: {
      type: 'Point',
      coordinates: [77.2250, 28.6470],
    },
    status: 'Verified',
    source: 'User',
    userName: 'Neha Verma',
    createdAt: '2026-10-25T21:15:00Z',
    upvotes: 42,
    address: 'Ajmeri Gate East Passway, New Delhi Railway Yard',
  },
  {
    hazardId: 'haz-delhi-003',
    type: 'Stray Animal Cluster',
    severity: 'Medium',
    description: 'Group of 5-7 stray dogs aggressive towards night pedestrians near Ridge forested corner.',
    location: {
      type: 'Point',
      coordinates: [77.2040, 28.6920],
    },
    status: 'Verified',
    source: 'User',
    userName: 'Kunal Malhotra',
    createdAt: '2026-10-24T22:30:00Z',
    upvotes: 29,
    address: 'North Campus Ridge Trail Exit, Delhi',
  },

  // ==================== MUMBAI ====================
  {
    hazardId: 'haz-mum-001',
    type: 'Cellular Dead Zone',
    severity: 'High',
    description: 'Complete signal drop beneath railway skywalk & underpass. Emergency calls and maps fail.',
    location: {
      type: 'Point',
      coordinates: [72.8360, 19.0490],
    },
    status: 'Verified',
    source: 'IoT',
    iotEventId: 'iot-ev-mum-01',
    createdAt: '2026-10-26T18:35:00Z',
    upvotes: 51,
    address: 'Bandra Railway Skywalk Sub-Level, Mumbai',
  },
  {
    hazardId: 'haz-mum-002',
    type: 'Isolated Stretch',
    severity: 'Medium',
    description: 'Dark reclamation road with high seawall and lack of foot traffic past 10:30 PM.',
    location: {
      type: 'Point',
      coordinates: [72.8210, 19.0390],
    },
    status: 'Verified',
    source: 'User',
    userName: 'Rohan Mehra',
    createdAt: '2026-10-25T23:00:00Z',
    upvotes: 34,
    address: 'Carter Road South Slip Lane, Bandra West, Mumbai',
  },
  {
    hazardId: 'haz-mum-003',
    type: 'Unlit Street',
    severity: 'High',
    description: 'Broken sodium fixtures along Dadar TT overbridge access stairwell.',
    location: {
      type: 'Point',
      coordinates: [72.8440, 19.0195],
    },
    status: 'Verified',
    source: 'User',
    userName: 'Anjali Sawant',
    createdAt: '2026-10-24T20:45:00Z',
    upvotes: 27,
    address: 'Dadar TT Bridge Pedestrian Stairway, Mumbai',
  },

  // ==================== BENGALURU ====================
  {
    hazardId: 'haz-blr-001',
    type: 'Unlit Street',
    severity: 'High',
    description: 'Complete street blackout for 200m between 4th Block park and 80ft road intersection.',
    location: {
      type: 'Point',
      coordinates: [77.6200, 12.9320],
    },
    status: 'Verified',
    source: 'IoT',
    iotEventId: 'iot-ev-blr-01',
    createdAt: '2026-10-26T21:10:00Z',
    upvotes: 46,
    address: '4th Block Park Lane, Koramangala, Bengaluru',
  },
  {
    hazardId: 'haz-blr-002',
    type: 'Flooded / Blocked Path',
    severity: 'Medium',
    description: 'Open storm water drain excavation with broken safety barricade. Pedestrians forced into traffic.',
    location: {
      type: 'Point',
      coordinates: [77.6380, 12.9730],
    },
    status: 'Verified',
    source: 'User',
    userName: 'Deepak Rao',
    createdAt: '2026-10-25T19:20:00Z',
    upvotes: 31,
    address: '100ft Road Corner, Indiranagar, Bengaluru',
  },
  {
    hazardId: 'haz-blr-003',
    type: 'Stray Animal Cluster',
    severity: 'Medium',
    description: 'Territorial stray dog pack near rear gate of bus stand depot.',
    location: {
      type: 'Point',
      coordinates: [77.5730, 12.9810],
    },
    status: 'Verified',
    source: 'User',
    userName: 'Suresh Kumar',
    createdAt: '2026-10-24T05:30:00Z',
    upvotes: 23,
    address: 'Majestic Depot Exit 4, Bengaluru',
  },

  // ==================== HYDERABAD ====================
  {
    hazardId: 'haz-hyd-001',
    type: 'Unlit Street',
    severity: 'High',
    description: 'Dark service lane under elevated metro pillars behind Cyber Towers.',
    location: {
      type: 'Point',
      coordinates: [78.3780, 17.4480],
    },
    status: 'Verified',
    source: 'User',
    userName: 'Pooja Reddy',
    createdAt: '2026-10-25T22:10:00Z',
    upvotes: 35,
    address: 'Hitec City Service By-pass, Madhapur, Hyderabad',
  },
  {
    hazardId: 'haz-hyd-002',
    type: 'Isolated Stretch',
    severity: 'Medium',
    description: 'Uninhabited rocky stretch bordering stadium boundary with zero night illumination.',
    location: {
      type: 'Point',
      coordinates: [78.3440, 17.4410],
    },
    status: 'Verified',
    source: 'User',
    userName: 'Vikram Teja',
    createdAt: '2026-10-24T21:40:00Z',
    upvotes: 28,
    address: 'Gachibowli Stadium Perimeter Road, Hyderabad',
  },

  // ==================== CHENNAI ====================
  {
    hazardId: 'haz-chn-001',
    type: 'Unlit Street',
    severity: 'High',
    description: 'Fused sodium mast at dark lane connecting station parking to Buckingham canal bridge.',
    location: {
      type: 'Point',
      coordinates: [78.2720, 13.0805],
    },
    status: 'Verified',
    source: 'User',
    userName: 'Karthik Subramanian',
    createdAt: '2026-10-25T20:15:00Z',
    upvotes: 39,
    address: 'Canal Service Road, Periyamet, Chennai',
  },
  {
    hazardId: 'haz-chn-002',
    type: 'Harassment Hotspot',
    severity: 'High',
    description: 'Poorly lit beach service cut with loitering groups after 10 PM.',
    location: {
      type: 'Point',
      coordinates: [80.2780, 13.0360],
    },
    status: 'Verified',
    source: 'User',
    userName: 'Divya Natarajan',
    createdAt: '2026-10-24T22:00:00Z',
    upvotes: 44,
    address: 'Lighthouse Rear Promenade, Santhome, Chennai',
  },

  // ==================== KOLKATA ====================
  {
    hazardId: 'haz-kol-001',
    type: 'Unlit Street',
    severity: 'High',
    description: 'Narrow lane behind railway godown without streetlights, heavy mud puddles.',
    location: {
      type: 'Point',
      coordinates: [88.3390, 22.5860],
    },
    status: 'Verified',
    source: 'User',
    userName: 'Debojit Chatterjee',
    createdAt: '2026-10-25T19:50:00Z',
    upvotes: 33,
    address: 'Howrah Station North Yard Passway, Kolkata',
  },
  {
    hazardId: 'haz-kol-002',
    type: 'Isolated Stretch',
    severity: 'Medium',
    description: 'Dark peripheral alley between corporate offices and marshland canal in Sector V.',
    location: {
      type: 'Point',
      coordinates: [88.4360, 22.5710],
    },
    status: 'Verified',
    source: 'User',
    userName: 'Ananya Sen',
    createdAt: '2026-10-24T21:15:00Z',
    upvotes: 26,
    address: 'Sector V Canal Side Link, Bidhannagar, Kolkata',
  },

  // ==================== PUNE ====================
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
    address: 'Library Lane, Shivaji Nagar, Pune',
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
    address: 'Near Old Bus Stand Gate 2, Pune',
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
    address: 'Behind Industrial Warehouse Yard, Pune',
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
    status: 'Pending',
    source: 'IoT',
    createdAt: '2026-10-24T05:49:00Z',
    upvotes: 4,
    address: 'Railway Underpass Passway, Pune',
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
    status: 'Pending',
    source: 'User',
    userId: 'usr-101',
    userName: 'Priya Sharma',
    createdAt: '2026-10-24T06:30:00Z',
    upvotes: 9,
    address: 'North Corner of City Garden, Pune',
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
    address: 'Library Lane North Bend, Pune',
  },
];

export const INITIAL_VERIFICATIONS: HazardVerificationDoc[] = [
  {
    verificationId: 'v-001',
    hazardId: 'haz-001',
    hazardTitle: 'Library Lane Outage',
    hazardType: 'Unlit Street',
    adminId: 'adm-01',
    adminName: 'Inspector R. Deshmukh',
    action: 'Approved',
    remarks: 'ESP32 sensor NODE-SHIVAJI-01 confirmed 3.8 Lux. Dispatched municipal lineman notice #882.',
    verifiedAt: '2026-10-24T06:30:00Z',
  },
  {
    verificationId: 'v-002',
    hazardId: 'haz-002',
    hazardTitle: 'Stray Dogs at Dumpster',
    hazardType: 'Stray Animal Cluster',
    adminId: 'adm-01',
    adminName: 'Inspector R. Deshmukh',
    action: 'Approved',
    remarks: 'Multiple citizen reports received. Animal control unit informed for humane relocation.',
    verifiedAt: '2026-10-23T22:05:00Z',
  },
];

// Helper to calculate distance in km
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Ensures realistic local civic hazards exist anywhere in India when the user pans or searches a new location.
 * If fewer than 3 hazards exist within 8 km, generates verified realistic local hazards.
 */
export function ensureRegionalHazards(centerLat: number, centerLng: number, existingHazards: HazardDoc[]): HazardDoc[] {
  const nearby = existingHazards.filter((h) => {
    const [lng, lat] = h.location.coordinates;
    return distanceKm(centerLat, centerLng, lat, lng) < 8;
  });

  if (nearby.length >= 3) {
    return existingHazards;
  }

  // Generate 3 realistic contextual hazards around this location
  const offsets = [
    { dLat: 0.0035, dLng: 0.0028, type: 'Unlit Street' as const, sev: 'High' as const, title: 'Unlit Service Lane', desc: 'Municipal sodium lights fused. Low pedestrian visibility after dark.' },
    { dLat: -0.0029, dLng: 0.0042, type: 'Stray Animal Cluster' as const, sev: 'Medium' as const, title: 'Stray Animal Pack', desc: 'Active stray animal pack reported near food refuse point.' },
    { dLat: 0.0045, dLng: -0.0038, type: 'Isolated Stretch' as const, sev: 'High' as const, title: 'Isolated Commercial By-lane', desc: 'Minimal night foot traffic, overgrown foliage with limited illumination.' },
  ];

  const newHazards: HazardDoc[] = offsets.map((off, index) => {
    const hLat = parseFloat((centerLat + off.dLat).toFixed(4));
    const hLng = parseFloat((centerLng + off.dLng).toFixed(4));
    return {
      hazardId: `haz-dyn-${Math.round(centerLat * 100)}-${Math.round(centerLng * 100)}-${index}`,
      type: off.type,
      severity: off.sev,
      description: off.desc,
      location: {
        type: 'Point',
        coordinates: [hLng, hLat],
      },
      status: 'Verified',
      source: index === 0 ? 'IoT' : 'User',
      createdAt: new Date().toISOString(),
      upvotes: 12 + index * 5,
      address: `Near ${off.title} (${hLat}°N, ${hLng}°E)`,
    };
  });

  return [...existingHazards, ...newHazards];
}

// Default Safe Route (Initial render)
export const INITIAL_SAFE_ROUTE: SafeRoutePlan = {
  id: 'safe',
  name: 'SafeRoute Shield Corridor (Recommended)',
  tagline: 'Illuminated public avenue, avoids unlit alleys & stray animal clusters',
  safetyScore: 94,
  durationMinutes: 14,
  distanceKm: 1.1,
  hazardsAvoided: 3,
  coordinates: [
    [18.5204, 73.8567],
    [18.5225, 73.8530],
    [18.5255, 73.8510],
    [18.5290, 73.8465],
    [18.5320, 73.8440],
  ],
  waypoints: [
    {
      instruction: 'Start along illuminated commercial spine',
      street: 'Primary Well-Lit Avenue',
      safeNote: 'Active foot traffic, 24/7 stores, continuous LED street lighting (88 Lux)',
    },
    {
      instruction: 'Continue along monitored transit corridor',
      street: 'Main Public Thoroughfare',
      safeNote: 'CCTV monitored, avoids unlit alleyways',
    },
    {
      instruction: 'Follow lighted avenue toward Safe Haven entrance',
      street: 'Civic Boulevard',
      safeNote: 'Maintains 200m buffer away from reported animal clusters',
    },
    {
      instruction: 'Arrive safely at Safe Haven destination',
      street: 'Protected Campus / Safe Haven Gate',
      safeNote: 'Guarded entrance with 24/7 public assistance',
    },
  ],
};

export const INITIAL_SHORTEST_ROUTE: SafeRoutePlan = {
  id: 'shortest',
  name: 'Shortest Raw Route (High Risk)',
  tagline: 'Direct shortcut via unlit service alleys & unmonitored passages',
  safetyScore: 42,
  durationMinutes: 10,
  distanceKm: 0.8,
  hazardsAvoided: 0,
  coordinates: [
    [18.5204, 73.8567],
    [18.5235, 73.8542],
    [18.5284, 73.8488],
    [18.5320, 73.8440],
  ],
  waypoints: [
    {
      instruction: 'Cut through unmonitored rear alley',
      street: 'Rear Service Lane',
      hazardWarning: '⚠️ WARNING: Stray dog cluster reported at dumpster. High risk after 9 PM.',
    },
    {
      instruction: 'Proceed down dark unlit passage',
      street: 'Unlit Shortcut Passage',
      hazardWarning: '⚠️ CRITICAL: 3 fused lights, complete darkness. Minimal cellular coverage.',
    },
  ],
};
