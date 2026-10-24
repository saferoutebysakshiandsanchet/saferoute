import React, { useState, useEffect } from 'react';
import { 
  INITIAL_HAZARDS, 
  INITIAL_VERIFICATIONS, 
  INITIAL_IOT_EVENTS, 
  INITIAL_USERS, 
  INITIAL_SAFE_ROUTE, 
  INITIAL_SHORTEST_ROUTE 
} from './data/saferouteDb';
import { 
  HazardDoc, 
  HazardVerificationDoc, 
  IoTEventDoc, 
  SafeRoutePlan, 
  UserDoc 
} from './types/saferoute';
import { SafeRouteMap } from './components/SafeRouteMap';
import { SafeRouteHeader } from './components/SafeRouteHeader';
import { GPSNavigationHUD } from './components/GPSNavigationHUD';
import { GPSSearchSheet } from './components/GPSSearchSheet';
import { ReportHazardModal } from './components/ReportHazardModal';
import { HazardDetailCard } from './components/HazardDetailCard';
import { AdminDevicePortal } from './components/AdminDevicePortal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ReportSummaryModal } from './components/ReportSummaryModal';
import { soundFx } from './utils/sound';
import { voiceGuidance } from './utils/speech';

export default function App() {
  // Device Environment Separation: 'customer' (Normal Citizen App) vs 'admin' (Municipal Admin Device)
  const [deviceType, setDeviceType] = useState<'customer' | 'admin'>('customer');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Database Collections State
  const [hazards, setHazards] = useState<HazardDoc[]>(INITIAL_HAZARDS);
  const [verifications, setVerifications] = useState<HazardVerificationDoc[]>(INITIAL_VERIFICATIONS);
  const [iotEvents, setIotEvents] = useState<IoTEventDoc[]>(INITIAL_IOT_EVENTS);

  // Navigation & GPS State (Customer App)
  const [activeRoute, setActiveRoute] = useState<SafeRoutePlan | null>(INITIAL_SAFE_ROUTE);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedHazard, setSelectedHazard] = useState<HazardDoc | null>(null);

  // GPS User Position & Recenter Tracker
  const [userPosition, setUserPosition] = useState<[number, number]>([18.5204, 73.8567]); // Deccan Gymkhana
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [clickedCoordinates, setClickedCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Customer App Settings & Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportSummaryOpen, setIsReportSummaryOpen] = useState(false);
  const [tileTheme, setTileTheme] = useState<'streets' | 'dark' | 'satellite'>('streets');
  const [isMuted, setIsMuted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Pending count for moderation badge
  const pendingCount = hazards.filter((h) => h.status === 'Pending').length;

  // Handle Map Click to Pin Hazard
  const handleMapClick = (lat: number, lng: number) => {
    setClickedCoordinates({ lat, lng });
    setIsReportModalOpen(true);
  };

  // Submit New Citizen Hazard Report (Enters as 'Pending' in administrative queue)
  const handleSubmitHazard = (newHazardData: Omit<HazardDoc, 'hazardId' | 'createdAt' | 'upvotes'>) => {
    const newId = `haz-${Date.now().toString().slice(-4)}`;
    const newDoc: HazardDoc = {
      ...newHazardData,
      hazardId: newId,
      createdAt: new Date().toISOString(),
      upvotes: 1,
    };

    setHazards((prev) => [newDoc, ...prev]);
    soundFx.playWaypointPing();
  };

  // Administrative Approval (Action performed only on Admin Device)
  const handleApproveHazard = (hazardId: string, remarks: string = 'Verified and approved.') => {
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
      adminId: 'adm-01',
      adminName: 'Inspector R. Deshmukh',
      action: 'Approved',
      remarks,
      verifiedAt: new Date().toISOString(),
    };

    setVerifications((prev) => [verificationRecord, ...prev]);
  };

  // Administrative Rejection (Action performed only on Admin Device)
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
      adminId: 'adm-01',
      adminName: 'Inspector R. Deshmukh',
      action: 'Rejected',
      remarks,
      verifiedAt: new Date().toISOString(),
    };

    setVerifications((prev) => [verificationRecord, ...prev]);
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
  };

  // Upvote Hazard
  const handleUpvoteHazard = (hazardId: string) => {
    setHazards((prev) =>
      prev.map((h) => (h.hazardId === hazardId ? { ...h, upvotes: h.upvotes + 1 } : h))
    );
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
    const route = activeRoute || INITIAL_SAFE_ROUTE;
    setActiveRoute(route);
    setIsNavigating(true);
    setCurrentStepIndex(0);
    setUserPosition(route.coordinates[0]);
    setRecenterTrigger((c) => c + 1);

    if (voiceEnabled) {
      voiceGuidance.speak(
        `Starting GPS navigation along ${route.name}. In 120 meters, ${route.waypoints[0].instruction}`
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
            tileTheme={tileTheme}
            onToggleTileTheme={handleToggleTileTheme}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            pendingCount={pendingCount}
          />

          {/* Customer Full-Screen Map & GPS Experience */}
          <main className="flex-1 relative overflow-hidden flex">
            <div className="flex-1 relative h-full w-full">
              <SafeRouteMap
                hazards={hazards}
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
              />

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
                  safeRoute={INITIAL_SAFE_ROUTE}
                  shortestRoute={INITIAL_SHORTEST_ROUTE}
                  activeRoute={activeRoute}
                  onSelectRoute={(r) => setActiveRoute(r)}
                  onStartGPS={handleStartGPS}
                  onOpenReportModal={() => {
                    setClickedCoordinates({ lat: userPosition[0], lng: userPosition[1] });
                    setIsReportModalOpen(true);
                  }}
                  onToggleHeatmap={() => setShowHeatmap((prev) => !prev)}
                  isHeatmapActive={showHeatmap}
                  onRecenter={handleRecenterGPS}
                />
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
          </main>
        </>
      )}
    </div>
  );
}
