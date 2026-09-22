import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import tripService from '../../services/tripService';
import driverService from '../../services/driverService';
import websocketService from '../../services/websocketService';
import monitoringService from '../../services/monitoringService';

// Driver App Components
import ActiveTripCard from './ActiveTripCard';
import MyVehicleCard from './MyVehicleCard';
import DriverMiniMap from './DriverMiniMap';
import DriverBottomNav from './DriverBottomNav';
import ReportIssueDrawer from './ReportIssueDrawer';
import Icon from '../ui/Icon';
import ErrorState from '../common/ErrorState';

const DriverApp = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('home');
  const [vehicle, setVehicle] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripEta, setTripEta] = useState(null);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showIssueDrawer, setShowIssueDrawer] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  const activeTripRef = useRef(null);
  const mapSectionRef = useRef(null);

  // Load Driver's Vehicle, Trips, and ETA
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get driver's own vehicle
      let myVehicle = null;
      try {
        myVehicle = await driverService.getMyVehicle();
        setVehicle(myVehicle);
      } catch (err) {
        console.warn('Could not load assigned vehicle:', err);
      }

      // 2. Get driver's trips
      const tripsResponse = await tripService.getMyTrips();
      const tripsList = Array.isArray(tripsResponse)
        ? tripsResponse
        : tripsResponse?.content || [];

      // Find current active trip: IN_PROGRESS first, then SCHEDULED
      const currentActive =
        tripsList.find((t) => t.status === 'IN_PROGRESS') ||
        tripsList.find((t) => t.status === 'SCHEDULED') ||
        null;
      setActiveTrip(currentActive);

      // Completed trips for history
      const completed = tripsList
        .filter((t) => t.status === 'COMPLETED')
        .slice(0, 5);
      setCompletedTrips(completed);

      // 3. Load ETA if active trip exists
      if (currentActive) {
        try {
          const eta = await tripService.getEta(currentActive.id);
          setTripEta(eta);
        } catch (e) {
          console.warn('Could not load ETA for trip:', e);
          setTripEta(null);
        }
      } else {
        setTripEta(null);
      }

      // 4. Load initial telemetry
      const targetVehicleId = myVehicle?.id || currentActive?.vehicle?.id;
      if (targetVehicleId) {
        try {
          const liveFleet = await monitoringService.getLiveFleet();
          const fleetList = Array.isArray(liveFleet) ? liveFleet : [];
          const currentTelemetry = fleetList.find((v) => v.vehicleId === targetVehicleId);
          if (currentTelemetry) {
            setTelemetry(currentTelemetry);
          }
        } catch (e) {
          console.warn('Could not load live fleet telemetry:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load driver app data:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to trips topic
    const unsubscribeTrips = websocketService.subscribe('/topic/trips', (data) => {
      if (!data) return;
      loadData();
    });

    // Subscribe to telemetry topic and filter for own vehicle
    const unsubscribeTelemetry = websocketService.subscribe('/topic/telemetry', (data) => {
      if (!data) return;
      const vehicleId = vehicle?.id || activeTrip?.vehicle?.id;
      if (vehicleId && (data.vehicleId === vehicleId || data.id === vehicleId)) {
        setTelemetry(data);
      }
    });

    return () => {
      unsubscribeTrips();
      unsubscribeTelemetry();
    };
  }, [loadData, vehicle?.id, activeTrip?.vehicle?.id]);

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabId === 'trip') {
      activeTripRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'map') {
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      setIsMapFullscreen((prev) => !prev);
    } else if (tabId === 'profile') {
      setShowProfileDrawer(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Icon name="RefreshCw" size={32} className="animate-spin text-blue-600 mb-3" />
        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Loading Driver Mobile Experience...
        </div>
        <p className="text-xs text-slate-400 mt-1">Connecting to vehicle telemetry & dispatch</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 flex flex-col justify-center max-w-md mx-auto">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile-first centered container */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950/70 border-x border-slate-200/60 dark:border-slate-800/60 shadow-xl relative pb-24">
        
        {/* TOP MOBILE HEADER */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'DR'}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                {user?.username || 'Driver'}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Driver Connected</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/driver')}
              title="Switch to Desktop Dashboard"
              className="h-10 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Icon name="Monitor" size={15} />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setShowProfileDrawer(true)}
              aria-label="Open menu"
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Icon name="Menu" size={18} />
            </button>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="p-4 space-y-4 flex-1">
          {/* 1. ACTIVE TRIP CARD */}
          <section ref={activeTripRef}>
            <ActiveTripCard
              trip={activeTrip}
              eta={tripEta}
              onTripUpdate={loadData}
              onReportIssueClick={() => setShowIssueDrawer(true)}
            />
          </section>

          {/* 2. MY VEHICLE CARD */}
          <section>
            <MyVehicleCard
              vehicle={vehicle || activeTrip?.vehicle}
              telemetry={telemetry}
            />
          </section>

          {/* 3. LIVE MINI MAP */}
          <section ref={mapSectionRef} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live GPS Location
              </span>
              <button
                onClick={() => setIsMapFullscreen((p) => !p)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{isMapFullscreen ? 'Collapse' : 'Expand'}</span>
                <Icon name={isMapFullscreen ? 'Minimize2' : 'Maximize2'} size={12} />
              </button>
            </div>
            <DriverMiniMap
              vehicle={vehicle || activeTrip?.vehicle}
              telemetry={telemetry}
              isFullscreen={isMapFullscreen}
              onToggleFullscreen={() => setIsMapFullscreen((p) => !p)}
            />
          </section>

          {/* 4. RECENT TRIPS LIST */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Icon name="History" size={16} className="text-slate-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Recent Completed Trips
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {completedTrips.length} recent
              </span>
            </div>

            {completedTrips.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No completed trips recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {completedTrips.map((ct) => (
                  <div key={ct.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        Trip #{ct.id} · {ct.vehicle?.licensePlate || 'Vehicle'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {ct.actualEndTime
                          ? new Date(ct.actualEndTime).toLocaleDateString()
                          : (ct.endTime ? new Date(ct.endTime).toLocaleDateString() : 'Completed')}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {(ct.distanceCovered || 0).toFixed(1)} km
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* BOTTOM MOBILE NAVIGATION */}
        <DriverBottomNav
          activeTab={activeTab}
          onSelectTab={handleTabSelect}
        />

        {/* REPORT ISSUE DRAWER */}
        {activeTrip && (
          <ReportIssueDrawer
            isOpen={showIssueDrawer}
            onClose={() => setShowIssueDrawer(false)}
            trip={activeTrip}
            onSuccess={loadData}
          />
        )}

        {/* PROFILE / MENU SLIDE-IN DRAWER */}
        {showProfileDrawer && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
            onClick={() => setShowProfileDrawer(false)}
          >
            <div
              className="w-full max-w-xs bg-white dark:bg-slate-900 h-full p-5 shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Driver Profile
                  </h3>
                  <button
                    onClick={() => setShowProfileDrawer(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <Icon name="X" size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-md">
                    {user?.username ? user.username.slice(0, 2).toUpperCase() : 'DR'}
                  </div>
                  <div>
                    <div className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {user?.username}
                    </div>
                    <div className="text-xs text-slate-400">{user?.email || 'driver@fleetfocus.com'}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      ROLE_DRIVER
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setShowProfileDrawer(false);
                      navigate('/driver');
                    }}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <Icon name="Monitor" size={18} className="text-blue-600" />
                    <span>Switch to Desktop Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileDrawer(false);
                      navigate('/my-trips');
                    }}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <Icon name="Navigation" size={18} className="text-indigo-600" />
                    <span>All My Trips</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowProfileDrawer(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Icon name="LogOut" size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverApp;
