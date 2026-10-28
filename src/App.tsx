import React, { useState, useEffect, useMemo } from 'react';
import { 
  INITIAL_HAZARDS, 
  INITIAL_VERIFICATIONS, 
  INITIAL_IOT_EVENTS, 
  INITIAL_USERS, 
  INITIAL_SAFE_ROUTE, 
  INITIAL_SHORTEST_ROUTE,
  ensureRegionalHazards
} from './data/saferouteDb';
import { PRESET_LOCATIONS, MAJOR_INDIAN_CITIES, IndianCity, getLocationsByCity } from './data/landmarks';
import { 
  HazardDoc, 
  HazardVerificationDoc, 
  IoTEventDoc, 
  SafeRoutePlan, 
  LocationPoint,
  UserDoc 
} from './types/saferoute';
import { verifyHazardWithAI } from './utils/aiVerificationEngine';
import { generateRoutes, calculateDistanceKm } from './utils/routePlanner';
import { LocateFixed, Bot } from 'lucide-react';
import { SafeRouteMap } from './components/SafeRouteMap';
import { SafeRouteHeader } from './components/SafeRouteHeader';
import { GPSNavigationHUD } from './components/GPSNavigationHUD';
import { GPSSearchSheet } from './components/GPSSearchSheet';
import { ReportHazardModal } from './components/ReportHazardModal';
import { HazardDetailCard } from './components/HazardDetailCard';
import { AdminDevicePortal } from './components/AdminDevicePortal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ReportSummaryModal } from './components/ReportSummaryModal';
import { OfflineMapsModal } from './components/OfflineMapsModal';
import { GeminiSafetyChatbot } from './components/GeminiSafetyChatbot';
import { WeatherSafetyHUD } from './components/WeatherSafetyHUD';
import { useAuth } from './context/AuthContext';
import { 
  subscribeToFirestoreHazards, 
  publishHazardToFirestore, 
  upvoteHazardInFirestore, 
  verifyHazardInFirestore 
} from './services/hazardSyncService';
import { 
  fetchLiveWeatherAlerts, 
  getSimulatedWeatherHazard, 
  WeatherCondition 
} from './services/weatherService';
import { getCachedTileCount } from './utils/offlineMapManager';
import { soundFx } from './utils/sound';
import { voiceGuidance } from './utils/speech';

export default function App() {
  const { currentUser, isAdmin } = useAuth();

  // Device Environment Separation: 'customer' (Normal Citizen App) vs 'admin' (Municipal Admin Device)
  const [deviceType, setDeviceType] = useState<'customer' | 'admin'>('customer');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [aiAutoPilot, setAiAutoPilot] = useState<boolean>(true); // Autonomous AI-by-IoT verification engine active by default

  // Gemini 3.8 Flash Safety Copilot State
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Live Weather Telemetry & Severe Weather Alerts State
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition | null>(null);
  const [weatherHazards, setWeatherHazards] = useState<HazardDoc[]>([]);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // Active City / Region Filter for Nationwide Coverage
  const [activeCityId, setActiveCityId] = useState<string>('all');

  // Database Collections State (Nationwide Pan-India Seed + Firestore Sync)
  const [hazards, setHazards] = useState<HazardDoc[]>(INITIAL_HAZARDS);
  const [verifications, setVerifications] = useState<HazardVerificationDoc[]>(INITIAL_VERIFICATIONS);
  const [iotEvents, setIotEvents] = useState<IoTEventDoc[]>(INITIAL_IOT_EVENTS);

  // Merge regular database hazards with real-time active weather alert hazards
  const combinedHazards = useMemo(() => {
    return [...hazards, ...weatherHazards];
  }, [hazards, weatherHazards]);

  // Google Maps Style Start Location & Destination State (Nationwide)
  const [originLocation, setOriginLocation] = useState<LocationPoint>(PRESET_LOCATIONS[0]); // Your Current Location
  const [destinationLocation, setDestinationLocation] = useState<LocationPoint>(PRESET_LOCATIONS[1]); // Default Verified Safe Haven
  const [selectedRouteType, setSelectedRouteType] = useState<'safe' | 'shortest'>('safe');
  const [pickingMode, setPickingMode] = useState<'origin' | 'destination' | null>(null);

  // Dynamically compute SafeRoute and ShortestRoute based on chosen Start & Destination + Hazard layer
  const routePlans = useMemo(() => {
    return generateRoutes(originLocation, destinationLocation, combinedHazards);
  }, [originLocation, destinationLocation, combinedHazards]);

  // Navigation & GPS State (Customer App)
  const [activeRoute, setActiveRoute] = useState<SafeRoutePlan | null>(INITIAL_SAFE_ROUTE);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedHazard, setSelectedHazard] = useState<HazardDoc | null>(null);

  // Keep activeRoute synced when not navigating
  useEffect(() => {
    if (!isNavigating) {
      setActiveRoute(selectedRouteType === 'safe' ? routePlans.safeRoute : routePlans.shortestRoute);
    }
  }, [routePlans, selectedRouteType, isNavigating]);

  // GPS User Position & Recenter Tracker (Defaults to national center or live device GPS)
  const [userPosition, setUserPosition] = useState<[number, number]>([28.6139, 77.2090]); // Delhi Capital Grid default
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [clickedCoordinates, setClickedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsToast, setGpsToast] = useState<{ message: string; sub?: string; type: 'success' | 'info' | 'warn' } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'prompt' | 'denied' | 'unknown'>('unknown');

  // Offline Maps & Cellular Dead Zone State
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [cachedTilesCount, setCachedTilesCount] = useState(0);

  // Customer App Settings & Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportSummaryOpen, setIsReportSummaryOpen] = useState(false);
  const [tileTheme, setTileTheme] = useState<'streets' | 'dark' | 'satellite'>('streets');
  const [isMuted, setIsMuted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Check location permission and attempt automatic GPS position fix on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        setLocationPermission(status.state as any);
        status.onchange = () => {
          setLocationPermission(status.state as any);
        };
      }).catch(() => {});
    }
    getCachedTileCount().then(setCachedTilesCount);

    // Prompt and acquire high-accuracy live device GPS across India
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy || 10);
          const realCoords: [number, number] = [lat, lng];

          setLocationPermission('granted');
          setUserPosition(realCoords);

          // Update origin with precise coordinates
          setOriginLocation({
            id: 'loc-current-gps',
            name: `My GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            category: 'current',
            address: `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E (±${accuracy}m)`,
            coordinates: realCoords,
            isSafeHaven: false,
          });

          // Auto-place local safe destination ~1.2 km away
          const localDest: [number, number] = [
            parseFloat((lat + 0.009).toFixed(4)),
            parseFloat((lng + 0.008).toFixed(4)),
          ];
          setDestinationLocation({
            id: `dest-local-${Date.now().toString().slice(-4)}`,
            name: 'Nearby Safe Haven Corridor',
            category: 'campus',
            address: `Well-lit safety corridor near your position (${localDest[0]}°N, ${localDest[1]}°E)`,
            coordinates: localDest,
            isSafeHaven: true,
          });

          // Ensure regional hazards exist around user's real location
          setHazards((prev) => ensureRegionalHazards(lat, lng, prev));
          setRecenterTrigger((c) => c + 1);

          // Reverse geocode to get actual street/locality/city name in India
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`)
            .then((res) => res.json())
            .then((data) => {
              const place =
                data.address?.suburb ||
                data.address?.neighbourhood ||
                data.address?.residential ||
                data.address?.road ||
                data.address?.city ||
                data.address?.town ||
                data.display_name?.split(',')[0] ||
                'My Current Location';

              setOriginLocation((prev) => ({
                ...prev,
                name: place,
                address: data.display_name || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
              }));

              setGpsToast({
                message: `📍 Live GPS Locked: ${place}`,
                sub: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (Accuracy: ±${accuracy}m)`,
                type: 'success',
              });
              setTimeout(() => setGpsToast(null), 3500);
            })
            .catch(() => {});
        },
        (err) => {
          console.log('GPS initial prompt state:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    }
  }, []);

  // Subscribe to real-time hazards in Firestore
  useEffect(() => {
    const unsubscribe = subscribeToFirestoreHazards(
      (cloudHazards) => {
        if (cloudHazards && cloudHazards.length > 0) {
          setHazards(cloudHazards);
        }
      },
      (error) => {
        console.warn('Firestore subscription offline fallback:', error.message);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch real-time weather alerts and telemetry for current coordinates / city
  const refreshLiveWeather = async (lat?: number, lng?: number, cityName?: string) => {
    const queryLat = lat ?? originLocation.coordinates[0];
    const queryLng = lng ?? originLocation.coordinates[1];
    const queryCity = cityName ?? originLocation.name;

    setIsWeatherLoading(true);
    try {
      const data = await fetchLiveWeatherAlerts(queryLat, queryLng, queryCity);
      setWeatherCondition(data.condition);
      setWeatherHazards(data.hazards);
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  useEffect(() => {
    refreshLiveWeather(originLocation.coordinates[0], originLocation.coordinates[1], originLocation.name);
  }, [originLocation.coordinates[0], originLocation.coordinates[1]]);

  // Trigger simulated severe weather hazard
  const handleSimulateWeather = (simType: 'rain' | 'fog') => {
    soundFx.playWaypointPing();
    const sim = getSimulatedWeatherHazard(
      simType,
      originLocation.coordinates[0],
      originLocation.coordinates[1],
      originLocation.name
    );
    setWeatherCondition(sim.condition);
    setWeatherHazards((prev) => [sim.hazard, ...prev.filter((h) => h.hazardId !== sim.hazard.hazardId)]);
    setGpsToast({
      message: simType === 'rain' ? '☔ Simulated Severe Rain & Flooding' : '🌫️ Simulated Dense Winter Fog',
      sub: 'Temporary weather hazard plotted on navigation layer',
      type: 'warn',
    });
    setTimeout(() => setGpsToast(null), 4000);
    if (voiceEnabled) {
      voiceGuidance.speak(
        simType === 'rain'
          ? 'Warning: Severe rain waterlogging hazard active on route.'
          : 'Advisory: Dense fog active. Low visibility ahead.'
      );
    }
  };

  // Pending count for moderation badge
  const pendingCount = hazards.filter((h) => h.status === 'Pending').length;

  // Google Maps Style Start Location & Destination Handlers
  const handleSelectOrigin = (loc: LocationPoint) => {
    setOriginLocation(loc);
    setUserPosition(loc.coordinates);
    setHazards((prev) => ensureRegionalHazards(loc.coordinates[0], loc.coordinates[1], prev));
    setRecenterTrigger((c) => c + 1);
    soundFx.playClick();
    if (voiceEnabled) {
      voiceGuidance.speak(`Start location set to ${loc.name}`);
    }
  };

  const handleSelectDestination = (loc: LocationPoint) => {
    setDestinationLocation(loc);
    setHazards((prev) => ensureRegionalHazards(loc.coordinates[0], loc.coordinates[1], prev));
    soundFx.playClick();
    if (voiceEnabled) {
      voiceGuidance.speak(`Destination set to ${loc.name}`);
    }
  };

  const handleSwapLocations = () => {
    const prevOrigin = originLocation;
    const prevDest = destinationLocation;
    setOriginLocation(prevDest);
    setDestinationLocation(prevOrigin);
    setUserPosition(prevDest.coordinates);
    setRecenterTrigger((c) => c + 1);
    soundFx.playClick();
    if (voiceEnabled) {
      voiceGuidance.speak(`Swapped route. Now heading to ${prevOrigin.name}.`);
    }
  };

  // Switch City / Metro across India
  const handleSelectCity = (city: IndianCity) => {
    soundFx.playClick();
    setActiveCityId(city.id);

    if (city.id === 'all') {
      const allIndiaCoords: [number, number] = [20.5937, 78.9629];
      setUserPosition(allIndiaCoords);
      setRecenterTrigger((c) => c + 1);
      setGpsToast({
        message: '🇮🇳 Pan-India Safety Grid',
        sub: 'Showing all national transit safety corridors',
        type: 'info',
      });
      setTimeout(() => setGpsToast(null), 3000);
      return;
    }

    const cityLocations = getLocationsByCity(city.id);
    const startLoc = cityLocations[0] || {
      id: `city-hub-${city.id}`,
      name: city.hubName,
      category: 'transit' as const,
      address: `${city.hubName}, ${city.name}, ${city.state}`,
      coordinates: city.coordinates,
      isSafeHaven: true,
      city: city.id,
      state: city.state,
    };

    const destLoc = cityLocations[1] || {
      id: `city-dest-${city.id}`,
      name: `${city.name} Safe Haven & Campus`,
      category: 'campus' as const,
      address: `High-illumination corridor, ${city.name}`,
      coordinates: [city.coordinates[0] + 0.012, city.coordinates[1] + 0.010],
      isSafeHaven: true,
      city: city.id,
      state: city.state,
    };

    setUserPosition(startLoc.coordinates);
    setOriginLocation(startLoc);
    setDestinationLocation(destLoc);
    setHazards((prev) => ensureRegionalHazards(city.coordinates[0], city.coordinates[1], prev));
    setRecenterTrigger((c) => c + 1);

    setGpsToast({
      message: `📍 Safety Grid: ${city.name}`,
      sub: `${city.tagline}`,
      type: 'success',
    });
    setTimeout(() => setGpsToast(null), 3500);

    if (voiceEnabled) {
      voiceGuidance.speak(`Safety grid switched to ${city.name}. Start set to ${startLoc.name}.`);
    }
  };

  // TRUE DEVICE GPS LOCATION HANDLER - Works anywhere in India without Pune lock!
  const handleUseCurrentLocation = () => {
    soundFx.playClick();
    setIsLocating(true);
    setGpsToast({
      message: 'Locking Live Device GPS...',
      sub: 'Querying high-accuracy hardware sensor',
      type: 'info',
    });

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy || 10);
          const realCoords: [number, number] = [lat, lng];

          setLocationPermission('granted');
          setUserPosition(realCoords);
          setIsLocating(false);

          // Update origin with precise coordinates immediately
          setOriginLocation({
            id: 'loc-current-gps',
            name: `My GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            category: 'current',
            address: `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E (Precision ±${accuracy}m)`,
            coordinates: realCoords,
            isSafeHaven: false,
          });

          // Smoothly pan map to user's real GPS position
          setRecenterTrigger((c) => c + 1);
          soundFx.playWaypointPing();

          // If current destination is very far (> 35 km away), auto-set a local safe destination ~1.2 km away
          const distToDest = calculateDistanceKm(realCoords, destinationLocation.coordinates);
          if (distToDest > 35) {
            const localDestCoords: [number, number] = [
              parseFloat((lat + 0.009).toFixed(4)), 
              parseFloat((lng + 0.008).toFixed(4))
            ];
            setDestinationLocation({
              id: `loc-local-hub-${Date.now().toString().slice(-4)}`,
              name: 'Nearby Safe Haven & Verified Transit Hub',
              category: 'campus',
              address: `Well-lit safety corridor near your position (${localDestCoords[0]}°N, ${localDestCoords[1]}°E)`,
              coordinates: localDestCoords,
              isSafeHaven: true,
            });
          }

          // Ensure regional hazards exist around user's GPS position
          setHazards((prev) => ensureRegionalHazards(lat, lng, prev));

          // Reverse geocode to get actual street/locality/city name in India
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`)
            .then((res) => res.json())
            .then((data) => {
              const place =
                data.address?.suburb ||
                data.address?.neighbourhood ||
                data.address?.residential ||
                data.address?.road ||
                data.address?.city ||
                data.address?.town ||
                data.display_name?.split(',')[0] ||
                'My Current Location';

              setOriginLocation((prev) => ({
                ...prev,
                name: place,
                address: data.display_name || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
              }));

              setGpsToast({
                message: `📍 GPS Locked: ${place}`,
                sub: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (Accuracy: ±${accuracy}m)`,
                type: 'success',
              });
              setTimeout(() => setGpsToast(null), 4000);
            })
            .catch(() => {
              setGpsToast({
                message: `📍 Device GPS Locked`,
                sub: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (Accuracy: ±${accuracy}m)`,
                type: 'success',
              });
              setTimeout(() => setGpsToast(null), 3500);
            });

          if (voiceEnabled) {
            voiceGuidance.speak('Real GPS position acquired and set as start location.');
          }
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setIsLocating(false);
          if (err.code === 1) {
            setLocationPermission('denied');
            setGpsToast({
              message: '⚠️ Location Permission Denied',
              sub: 'Please grant location rights in your browser address bar',
              type: 'warn',
            });
          } else {
            setGpsToast({
              message: '⚠️ GPS Hardware Timeout',
              sub: 'Choose any Indian city or landmark from the search bar',
              type: 'warn',
            });
          }
          setTimeout(() => setGpsToast(null), 4500);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      setGpsToast({
        message: 'Browser Geolocation Not Supported',
        sub: 'Please use a modern GPS-capable mobile or desktop browser',
        type: 'warn',
      });
      setTimeout(() => setGpsToast(null), 4000);
    }
  };

  const handleRequestLocationRights = () => {
    soundFx.playClick();
    if (locationPermission === 'denied') {
      setGpsToast({
        message: '📍 Location Access is Blocked',
        sub: 'Tap the lock/settings icon in your browser address bar and switch Location to "Allow"',
        type: 'warn',
      });
      setTimeout(() => setGpsToast(null), 5000);
    } else {
      handleUseCurrentLocation();
    }
  };

  const handlePickOnMap = (target: 'origin' | 'destination') => {
    setPickingMode(target);
    soundFx.playClick();
  };

  // Handle Map Click to Pin Hazard or Pick Start/Destination
  const handleMapClick = (lat: number, lng: number) => {
    if (pickingMode === 'origin') {
      const customLoc: LocationPoint = {
        id: `loc-custom-${Date.now().toString().slice(-4)}`,
        name: `Pinned Start (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        category: 'custom',
        address: `Custom Pinned Coordinates [${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
        coordinates: [lat, lng],
      };
      setOriginLocation(customLoc);
      setUserPosition([lat, lng]);
      setPickingMode(null);
      soundFx.playWaypointPing();
      if (voiceEnabled) voiceGuidance.speak('Start location set from map.');
      return;
    }

    if (pickingMode === 'destination') {
      const customLoc: LocationPoint = {
        id: `loc-custom-${Date.now().toString().slice(-4)}`,
        name: `Pinned Destination (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        category: 'custom',
        address: `Custom Pinned Coordinates [${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
        coordinates: [lat, lng],
      };
      setDestinationLocation(customLoc);
      setPickingMode(null);
      soundFx.playWaypointPing();
      if (voiceEnabled) voiceGuidance.speak('Destination set from map.');
      return;
    }

    // Default map click: Report Hazard modal
    setClickedCoordinates({ lat, lng });
    setIsReportModalOpen(true);
  };

  // Submit New Citizen Hazard Report
  const handleSubmitHazard = (newHazardData: Omit<HazardDoc, 'hazardId' | 'createdAt' | 'upvotes'>) => {
    const newId = `haz-${Date.now().toString().slice(-4)}`;
    const newDoc: HazardDoc = {
      ...newHazardData,
      hazardId: newId,
      createdAt: new Date().toISOString(),
      upvotes: 1,
      userId: currentUser?.uid,
      userName: currentUser?.displayName || 'Citizen Reporter',
    };

    setHazards((prev) => [newDoc, ...prev]);
    soundFx.playWaypointPing();

    // Persist report to Firestore cloud database
    publishHazardToFirestore(
      newDoc,
      currentUser?.uid || 'guest_citizen',
      currentUser?.displayName || 'Citizen Reporter',
      originLocation.city || 'India'
    ).catch(console.warn);

    // Autonomous AI Verification handling via IoT edge telemetry
    if (aiAutoPilot) {
      setTimeout(() => {
        const aiResult = verifyHazardWithAI(newDoc, iotEvents);
        
        setHazards((prev) =>
          prev.map((h) =>
            h.hazardId === newId
              ? {
                  ...h,
                  status: aiResult.decision === 'Approved' ? 'Verified' : 'Rejected',
                  rejectionRemarks: aiResult.decision === 'Rejected' ? aiResult.reasoning : undefined,
                }
              : h
          )
        );

        const verificationRecord: HazardVerificationDoc = {
          verificationId: `v-ai-${Date.now().toString().slice(-4)}`,
          hazardId: newId,
          hazardTitle: newDoc.address || newDoc.type,
          hazardType: newDoc.type,
          adminId: 'ai-sentinel-core',
          adminName: 'SafeRoute Sentinel AI (IoT Verified)',
          action: aiResult.decision,
          remarks: `${aiResult.reasoning} [IoT Sensor Proof: ${aiResult.sensorProof}] (Confidence: ${aiResult.confidence}%)`,
          verifiedAt: new Date().toISOString(),
        };

        setVerifications((prev) => [verificationRecord, ...prev]);
        soundFx.playWaypointPing();

        // Sync verification decision to Firestore
        verifyHazardInFirestore(
          newId,
          aiResult.decision === 'Approved' ? 'Verified' : 'Rejected',
          'ai-sentinel-core',
          'SafeRoute Sentinel AI (IoT Verified)',
          aiResult.reasoning
        ).catch(console.warn);

        if (voiceEnabled && aiResult.decision === 'Approved') {
          voiceGuidance.speak(
            `Hazard verified by AI with edge IoT sensors. It is now published on the public safety map.`
          );
        }
      }, 1100);
    }
  };

  // Autonomous batch AI verification across all pending reports using IoT telemetry
  const handleRunAIVerificationScan = () => {
    const pendingItems = hazards.filter((h) => h.status === 'Pending');
    if (pendingItems.length === 0) return;

    soundFx.playWaypointPing();
    const updatedHazards = [...hazards];
    const newAuditEntries: HazardVerificationDoc[] = [];

    pendingItems.forEach((hazard) => {
      const aiResult = verifyHazardWithAI(hazard, iotEvents);
      const index = updatedHazards.findIndex((h) => h.hazardId === hazard.hazardId);
      if (index !== -1) {
        if (aiResult.decision === 'Approved') {
          updatedHazards[index] = { ...updatedHazards[index], status: 'Verified' };
          newAuditEntries.unshift({
            verificationId: `v-ai-${Date.now().toString().slice(-4)}-${hazard.hazardId.slice(-3)}`,
            hazardId: hazard.hazardId,
            hazardTitle: hazard.address || hazard.type,
            hazardType: hazard.type,
            adminId: 'ai-sentinel-core',
            adminName: 'SafeRoute Autonomous AI (IoT Verified)',
            action: 'Approved',
            remarks: `${aiResult.reasoning} [IoT Proof: ${aiResult.sensorProof}] (Confidence: ${aiResult.confidence}%)`,
            verifiedAt: new Date().toISOString(),
          });
        } else {
          updatedHazards[index] = { ...updatedHazards[index], status: 'Rejected', rejectionRemarks: aiResult.reasoning };
          newAuditEntries.unshift({
            verificationId: `v-ai-${Date.now().toString().slice(-4)}-${hazard.hazardId.slice(-3)}`,
            hazardId: hazard.hazardId,
            hazardTitle: hazard.address || hazard.type,
            hazardType: hazard.type,
            adminId: 'ai-sentinel-core',
            adminName: 'SafeRoute Autonomous AI (IoT Verified)',
            action: 'Rejected',
            remarks: `${aiResult.reasoning} [Sensor Proof: ${aiResult.sensorProof}]`,
            verifiedAt: new Date().toISOString(),
          });
        }
      }
    });

    setHazards(updatedHazards);
    setVerifications((prev) => [...newAuditEntries, ...prev]);
  };

  // Administrative Approval (Action performed on Admin Device)
  const handleApproveHazard = (hazardId: string, remarks: string = 'Verified and approved by AI.') => {
    const targetHazard = hazards.find((h) => h.hazardId === hazardId);
    if (!targetHazard) return;

    setHazards((prev) =>
      prev.map((h) => (h.hazardId === hazardId ? { ...h, status: 'Verified' as const } : h))
    );

    const verificationRecord: HazardVerificationDoc = {
      verificationId: `v-${Date.now().toString().slice(-4)}`,
      hazardId,
      hazardTitle: targetHazard.address || targetHazard.type,
      hazardType: targetHazard.type,
      adminId: currentUser?.uid || 'adm-01',
      adminName: currentUser?.displayName || 'SafeRoute Admin',
      action: 'Approved',
      remarks,
      verifiedAt: new Date().toISOString(),
    };

    setVerifications((prev) => [verificationRecord, ...prev]);

    // Persist verification to Firestore
    verifyHazardInFirestore(
      hazardId,
      'Verified',
      currentUser?.uid || 'adm-01',
      currentUser?.displayName || 'SafeRoute Admin',
      remarks
    ).catch(console.warn);
  };

  // Administrative Rejection (Action performed on Admin Device)
  const handleRejectHazard = (hazardId: string, remarks: string) => {
    const targetHazard = hazards.find((h) => h.hazardId === hazardId);
    if (!targetHazard) return;

    setHazards((prev) =>
      prev.map((h) => (h.hazardId === hazardId ? { ...h, status: 'Rejected' as const, rejectionRemarks: remarks } : h))
    );

    const verificationRecord: HazardVerificationDoc = {
      verificationId: `v-${Date.now().toString().slice(-4)}`,
      hazardId,
      hazardTitle: targetHazard.address || targetHazard.type,
      hazardType: targetHazard.type,
      adminId: currentUser?.uid || 'adm-01',
      adminName: currentUser?.displayName || 'SafeRoute Admin',
      action: 'Rejected',
      remarks,
      verifiedAt: new Date().toISOString(),
    };

    setVerifications((prev) => [verificationRecord, ...prev]);

    // Persist rejection to Firestore
    verifyHazardInFirestore(
      hazardId,
      'Rejected',
      currentUser?.uid || 'adm-01',
      currentUser?.displayName || 'SafeRoute Admin',
      remarks
    ).catch(console.warn);
  };

  // IoT Telemetry Packet Transmission (ESP32)
  const handleTransmitIoTEvent = (
    event: IoTEventDoc,
    hazard: Omit<HazardDoc, 'hazardId' | 'createdAt' | 'upvotes'>
  ) => {
    setIotEvents((prev) => [event, ...prev]);

    const newHazardDoc: HazardDoc = {
      ...hazard,
      hazardId: `haz-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      upvotes: 2,
    };

    setHazards((prev) => [newHazardDoc, ...prev]);

    publishHazardToFirestore(
      newHazardDoc,
      'iot_edge_gateway',
      'ESP32 Telemetry Sentinel',
      originLocation.city || 'India'
    ).catch(console.warn);
  };

  // Upvote Hazard
  const handleUpvoteHazard = (hazardId: string) => {
    const existing = hazards.find((h) => h.hazardId === hazardId);
    const count = existing ? existing.upvotes : 1;
    setHazards((prev) =>
      prev.map((h) => (h.hazardId === hazardId ? { ...h, upvotes: h.upvotes + 1 } : h))
    );
    upvoteHazardInFirestore(hazardId, count).catch(console.warn);
  };

  // Tile Theme Toggle
  const handleToggleTileTheme = () => {
    soundFx.playClick();
    setTileTheme((cur) => (cur === 'streets' ? 'dark' : cur === 'dark' ? 'satellite' : 'streets'));
  };

  // Audio Toggle
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFx.enabled = !next;
  };

  // Start GPS Navigation
  const handleStartGPS = () => {
    const route = activeRoute || routePlans.safeRoute;
    setActiveRoute(route);
    setIsNavigating(true);
    setCurrentStepIndex(0);
    setUserPosition(route.coordinates[0]);
    setRecenterTrigger((c) => c + 1);

    if (voiceEnabled) {
      voiceGuidance.speak(
        `Starting GPS navigation from ${originLocation.name} to ${destinationLocation.name} along ${route.name}. In 100 meters, ${route.waypoints[0].instruction}`
      );
    }
  };

  // Exit GPS Navigation
  const handleExitGPS = () => {
    setIsNavigating(false);
    setCurrentStepIndex(0);
    voiceGuidance.stop();
  };

  // Recenter GPS Camera
  const handleRecenterGPS = () => {
    setRecenterTrigger((c) => c + 1);
    soundFx.playClick();
    setGpsToast({
      message: '📍 Centered on GPS Location',
      sub: `${originLocation.name}`,
      type: 'info',
    });
    setTimeout(() => setGpsToast(null), 2500);
  };

  // Voice speech announcement on step transition
  useEffect(() => {
    if (isNavigating && activeRoute && voiceEnabled && currentStepIndex > 0) {
      const wp = activeRoute.waypoints[currentStepIndex];
      if (wp) {
        let phrase = wp.instruction;
        if (wp.safeNote) phrase += `. ${wp.safeNote}`;
        if (wp.hazardWarning) phrase += `. Caution: ${wp.hazardWarning}`;
        voiceGuidance.speak(phrase);
      }
    }
  }, [currentStepIndex, isNavigating, activeRoute, voiceEnabled]);

  // Simulated walking navigation along active route
  useEffect(() => {
    if (!isNavigating || !activeRoute) return;

    const coords = activeRoute.coordinates;
    let step = currentStepIndex;

    const interval = setInterval(() => {
      if (step < coords.length - 1) {
        step += 1;
        setCurrentStepIndex(step);
        setUserPosition(coords[step]);
        soundFx.playWaypointPing();
      } else {
        setIsNavigating(false);
        soundFx.playWaypointPing();
        if (voiceEnabled) {
          voiceGuidance.speak('You have safely arrived at your destination.');
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isNavigating, activeRoute, currentStepIndex, voiceEnabled]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0e16] text-[#dfe2ee]">
      {/* ========================================================
          CASE 1: DEDICATED MUNICIPAL ADMIN DEVICE / TERMINAL
         ======================================================== */}
      {deviceType === 'admin' ? (
        <AdminDevicePortal
          hazards={hazards}
          verifications={verifications}
          iotEvents={iotEvents}
          onApproveHazard={handleApproveHazard}
          onRejectHazard={handleRejectHazard}
          onTransmitIoTEvent={handleTransmitIoTEvent}
          onExitToCustomerApp={() => setDeviceType('customer')}
          currentMapCenter={{ lat: userPosition[0], lng: userPosition[1] }}
          onRunAIVerificationScan={handleRunAIVerificationScan}
          aiAutoPilot={aiAutoPilot}
          onToggleAIAutoPilot={() => setAiAutoPilot((v) => !v)}
        />
      ) : (
        /* ========================================================
            CASE 2: NORMAL CUSTOMER APP (Clean GPS Navigation)
           ======================================================== */
        <>
          {/* Customer App Top Header */}
          <SafeRouteHeader
            onOpenPinHazard={() => {
              setClickedCoordinates({ lat: userPosition[0], lng: userPosition[1] });
              setIsReportModalOpen(true);
            }}
            onOpenReportSummary={() => setIsReportSummaryOpen(true)}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            onOpenChatbot={() => setIsChatbotOpen(true)}
            tileTheme={tileTheme}
            onToggleTileTheme={handleToggleTileTheme}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            pendingCount={pendingCount}
            onOpenOfflineMaps={() => setIsOfflineModalOpen(true)}
            isSimulatedOffline={isSimulatedOffline}
            cachedTilesCount={cachedTilesCount}
            locationPermission={locationPermission}
            onRequestLocationRights={handleRequestLocationRights}
          />

          {/* Customer Full-Screen Map & GPS Experience */}
          <main className="flex-1 relative overflow-hidden flex">
            <div className="flex-1 relative h-full w-full">
              <SafeRouteMap
                hazards={combinedHazards}
                activeRoute={activeRoute}
                selectedHazard={selectedHazard}
                onSelectHazard={setSelectedHazard}
                onMapClickCoordinates={handleMapClick}
                userPosition={userPosition}
                showPendingInMap={false} // Customers only see VERIFIED public hazards!
                onUpvoteHazard={handleUpvoteHazard}
                tileTheme={tileTheme}
                isNavigating={isNavigating}
                recenterTrigger={recenterTrigger}
                showHeatmap={showHeatmap}
                onToggleHeatmap={() => setShowHeatmap((prev) => !prev)}
                origin={originLocation}
                destination={destinationLocation}
                pickingMode={pickingMode}
                onCancelPickingMode={() => setPickingMode(null)}
                isSimulatedOffline={isSimulatedOffline}
              />

              {/* Real-Time Live Weather Alert HUD */}
              <div className="absolute top-3 right-3 sm:right-16 z-30 max-w-[280px] sm:max-w-xs pointer-events-auto">
                <WeatherSafetyHUD
                  weather={weatherCondition}
                  cityName={originLocation.name?.split(',')[0] || 'Current City'}
                  isLoading={isWeatherLoading}
                  onRefresh={() => refreshLiveWeather()}
                  onSimulateWeather={handleSimulateWeather}
                  weatherHazardsCount={weatherHazards.length}
                />
              </div>

              {/* Floating Gemini Copilot FAB */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsChatbotOpen(true);
                }}
                title="Ask SafeRoute Copilot (Gemini 3.8 Flash)"
                className="absolute bottom-6 right-6 z-30 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-cyan-400/40 cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <Bot className="w-4 h-4 text-cyan-200" />
                <span className="font-mono tracking-wide">COPILOT</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </button>

              {/* If Navigating: Turn-by-Turn GPS Banner & Trip HUD */}
              {isNavigating && activeRoute ? (
                <GPSNavigationHUD
                  route={activeRoute}
                  currentStepIndex={currentStepIndex}
                  onExitNavigation={handleExitGPS}
                  onRecenterGPS={handleRecenterGPS}
                  onOpenReport={() => {
                    setClickedCoordinates({ lat: userPosition[0], lng: userPosition[1] });
                    setIsReportModalOpen(true);
                  }}
                  voiceEnabled={voiceEnabled}
                  onToggleVoice={() => setVoiceEnabled((v) => !v)}
                  speedKmh={4.8}
                />
              ) : (
                /* If Not Navigating: Google Maps Style Search & Start Route Sheet */
                <GPSSearchSheet
                  origin={originLocation}
                  destination={destinationLocation}
                  onSelectOrigin={handleSelectOrigin}
                  onSelectDestination={handleSelectDestination}
                  onSwapLocations={handleSwapLocations}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  onPickOnMap={handlePickOnMap}
                  safeRoute={routePlans.safeRoute}
                  shortestRoute={routePlans.shortestRoute}
                  activeRoute={activeRoute}
                  onSelectRoute={(r) => {
                    setActiveRoute(r);
                    setSelectedRouteType(r.id);
                  }}
                  onStartGPS={handleStartGPS}
                  onOpenReportModal={() => {
                    setClickedCoordinates({ lat: userPosition[0], lng: userPosition[1] });
                    setIsReportModalOpen(true);
                  }}
                  onToggleHeatmap={() => setShowHeatmap((prev) => !prev)}
                  isHeatmapActive={showHeatmap}
                  onRecenter={handleRecenterGPS}
                  userPosition={userPosition}
                  isLocating={isLocating}
                  onSelectCity={handleSelectCity}
                  activeCityId={activeCityId}
                />
              )}

              {/* Floating Live GPS Feedback Toast */}
              {gpsToast && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-[#0f172a]/95 backdrop-blur-md text-white border border-cyan-500/50 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 pointer-events-none max-w-[90vw]">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <LocateFixed size={18} className={gpsToast.type === 'info' && isLocating ? 'animate-spin' : ''} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{gpsToast.message}</span>
                      {isLocating && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                    </div>
                    {gpsToast.sub && <div className="text-[11px] text-slate-300 font-mono-telemetry">{gpsToast.sub}</div>}
                  </div>
                </div>
              )}

              {/* Hazard Detail Card on Pin Click */}
              {selectedHazard && (
                <HazardDetailCard
                  hazard={selectedHazard}
                  onClose={() => setSelectedHazard(null)}
                  onUpvote={handleUpvoteHazard}
                  userPosition={userPosition}
                  onAvoidInRoute={() => {
                    soundFx.playClick();
                    setActiveRoute(INITIAL_SAFE_ROUTE);
                    setSelectedHazard(null);
                  }}
                />
              )}
            </div>

            {/* Citizen Pin Hazard Modal */}
            <ReportHazardModal
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
              onSubmitHazard={handleSubmitHazard}
              clickedCoordinates={clickedCoordinates}
              currentUserName="Citizen User"
            />

            {/* Admin PIN Login Modal (To access Admin Device) */}
            <AdminLoginModal
              isOpen={isAdminLoginOpen}
              onClose={() => setIsAdminLoginOpen(false)}
              onSuccessLogin={() => setDeviceType('admin')}
            />

            {/* Academic Project Report Summary Modal (Chapters 1–4) */}
            <ReportSummaryModal
              isOpen={isReportSummaryOpen}
              onClose={() => setIsReportSummaryOpen(false)}
            />

            {/* Offline Maps & Cellular Dead Zone Storage Modal */}
            <OfflineMapsModal
              isOpen={isOfflineModalOpen}
              onClose={() => {
                setIsOfflineModalOpen(false);
                getCachedTileCount().then(setCachedTilesCount);
              }}
              currentLat={userPosition[0]}
              currentLng={userPosition[1]}
              currentLocationName={originLocation.name}
              isSimulatedOffline={isSimulatedOffline}
              onToggleSimulatedOffline={() => {
                setIsSimulatedOffline((prev) => !prev);
                setGpsToast({
                  message: !isSimulatedOffline ? '⚡ Cellular Dead Zone Mode Activated' : '🌐 Online Map Mode Restored',
                  sub: !isSimulatedOffline ? 'Serving cached safety tiles & on-device routing' : 'Live map & telemetry stream active',
                  type: 'info',
                });
                setTimeout(() => setGpsToast(null), 3500);
              }}
            />

            {/* Gemini 3.8 Flash Safety Copilot Drawer */}
            <GeminiSafetyChatbot
              isOpen={isChatbotOpen}
              onClose={() => setIsChatbotOpen(false)}
              userLocation={originLocation}
              destinationLocation={destinationLocation}
              activeHazardsCount={combinedHazards.length}
              cityName={originLocation.name || 'India'}
            />
          </main>
        </>
      )}
    </div>
  );
}
