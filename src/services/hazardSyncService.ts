import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { HazardDoc } from '../types/saferoute';
import { INITIAL_HAZARDS } from '../data/saferouteDb';

export function subscribeToFirestoreHazards(
  onUpdate: (hazards: HazardDoc[]) => void,
  onError?: (err: Error) => void
) {
  const hazardsRef = collection(db, 'hazards');

  // Try real-time listener
  const unsubscribe = onSnapshot(
    hazardsRef,
    (snapshot) => {
      if (snapshot.empty) {
        // First boot or no hazards in cloud database, seed initial hazards asynchronously
        seedInitialHazardsToFirestore().catch(console.warn);
        onUpdate(INITIAL_HAZARDS);
        return;
      }

      const list: HazardDoc[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          hazardId: docSnap.id,
          type: data.type,
          severity: data.severity,
          description: data.description,
          location: {
            type: 'Point',
            coordinates: [data.lng, data.lat],
          },
          status: data.verified ? 'Verified' : (data.status || 'Verified'),
          source: data.source === 'weather_api' ? 'Weather' : (data.source === 'iot_sensor' ? 'IoT' : 'User'),
          userId: data.reportedBy,
          userName: data.reporterName,
          createdAt: data.reportedAt,
          upvotes: data.upvotes ?? 1,
          address: data.address || `${data.city || 'India'} Civic Zone`,
        });
      });

      if (list.length > 0) {
        onUpdate(list);
      }
    },
    (error) => {
      console.warn('Firestore subscription offline/fallback active:', error.message);
      if (onError) onError(error);
      // Fallback to local database
      onUpdate(INITIAL_HAZARDS);
    }
  );

  return unsubscribe;
}

export async function seedInitialHazardsToFirestore() {
  try {
    const hazardsRef = collection(db, 'hazards');
    const existing = await getDocs(query(hazardsRef, limit(1)));
    if (!existing.empty) return;

    // Seed initial batch of curated hazards across cities
    for (const h of INITIAL_HAZARDS.slice(0, 15)) {
      const docRef = doc(db, 'hazards', h.hazardId);
      await setDoc(docRef, {
        id: h.hazardId,
        type: mapTypeToBlueprint(h.type),
        severity: h.severity.toLowerCase(),
        title: h.address || h.description.slice(0, 50),
        description: h.description,
        lat: h.location.coordinates[1],
        lng: h.location.coordinates[0],
        city: extractCity(h.address),
        verified: h.status === 'Verified',
        verifiedBy: h.source === 'IoT' ? 'IoT Edge Sentinel' : 'Civic Safety Board',
        upvotes: h.upvotes,
        reportedBy: h.userId || 'system_seed',
        reporterName: h.userName || 'SafeRoute Verifier',
        reportedAt: h.createdAt,
        source: h.source === 'IoT' ? 'iot_sensor' : (h.source === 'Weather' ? 'weather_api' : 'citizen'),
        address: h.address || 'Civic Corridor',
      });
    }
  } catch (err) {
    console.warn('Could not seed initial Firestore hazards (likely unauthenticated guest or rules restriction):', err);
  }
}

export async function publishHazardToFirestore(
  hazard: HazardDoc,
  userUid: string,
  userName: string,
  city: string = 'Current Zone'
) {
  try {
    const docRef = doc(db, 'hazards', hazard.hazardId);
    await setDoc(docRef, {
      id: hazard.hazardId,
      type: mapTypeToBlueprint(hazard.type),
      severity: hazard.severity.toLowerCase(),
      title: hazard.address || hazard.description.slice(0, 60),
      description: hazard.description,
      lat: hazard.location.coordinates[1],
      lng: hazard.location.coordinates[0],
      city: city || 'India',
      verified: hazard.status === 'Verified',
      verifiedBy: hazard.source === 'IoT' ? 'IoT Telemetry' : (hazard.source === 'Weather' ? 'Meteorological Sensor' : ''),
      upvotes: hazard.upvotes || 1,
      reportedBy: userUid,
      reporterName: userName,
      reportedAt: hazard.createdAt,
      source: hazard.source === 'IoT' ? 'iot_sensor' : (hazard.source === 'Weather' ? 'weather_api' : 'citizen'),
      address: hazard.address || 'Civic Corridor',
    });
    return true;
  } catch (err) {
    console.error('Failed to publish hazard to Firestore:', err);
    return false;
  }
}

export async function upvoteHazardInFirestore(hazardId: string, currentUpvotes: number) {
  try {
    const docRef = doc(db, 'hazards', hazardId);
    await updateDoc(docRef, {
      upvotes: currentUpvotes + 1,
    });
    return true;
  } catch (err) {
    console.warn('Failed to upvote in Firestore:', err);
    return false;
  }
}

export async function verifyHazardInFirestore(
  hazardId: string,
  status: 'Verified' | 'Rejected',
  adminUid: string,
  adminName: string,
  remarks: string = ''
) {
  try {
    const docRef = doc(db, 'hazards', hazardId);
    await updateDoc(docRef, {
      verified: status === 'Verified',
      verifiedBy: `${adminName} (${adminUid})`,
      status,
      remarks,
    });

    // Write to verifications subcollection
    const verificationRef = doc(collection(db, 'hazards', hazardId, 'verifications'));
    await setDoc(verificationRef, {
      hazardId,
      verifiedBy: adminUid,
      status: status.toLowerCase(),
      notes: remarks || `Status set to ${status} by admin`,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (err) {
    console.error('Failed to verify hazard in Firestore:', err);
    return false;
  }
}

function mapTypeToBlueprint(t: string): string {
  if (t.includes('Weather') || t.includes('Rain') || t.includes('Fog')) {
    if (t.includes('Waterlogging')) return 'waterlogging';
    return 'weather_alert';
  }
  if (t.includes('Unlit')) return 'lighting';
  if (t.includes('Isolated')) return 'dark_alley';
  if (t.includes('Flooded')) return 'waterlogging';
  if (t.includes('Harassment')) return 'unsafe_crowd';
  return 'lighting';
}

function extractCity(address?: string): string {
  if (!address) return 'Delhi';
  if (address.includes('Pune')) return 'Pune';
  if (address.includes('Delhi') || address.includes('Gurgaon') || address.includes('Noida')) return 'Delhi';
  if (address.includes('Mumbai') || address.includes('Bandra')) return 'Mumbai';
  if (address.includes('Bengaluru') || address.includes('Bangalore')) return 'Bengaluru';
  if (address.includes('Hyderabad')) return 'Hyderabad';
  if (address.includes('Chennai')) return 'Chennai';
  if (address.includes('Kolkata')) return 'Kolkata';
  if (address.includes('Ahmedabad')) return 'Ahmedabad';
  if (address.includes('Jaipur')) return 'Jaipur';
  return 'India';
}
