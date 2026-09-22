import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import Icon from '../ui/Icon';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const vehicleMarkerIcon = L.divIcon({
  className: 'driver-vehicle-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #2563eb;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
        <circle cx="17" cy="18" r="2"/>
        <circle cx="7" cy="18" r="2"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

// Component to dynamically re-center map when coordinates change
const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
};

const DriverMiniMap = ({ vehicle, telemetry, isFullscreen = false, onToggleFullscreen }) => {
  const lat = telemetry?.latitude ?? telemetry?.lat ?? 37.7749;
  const lng = telemetry?.longitude ?? telemetry?.lng ?? -122.4194;
  const hasCoordinates = (telemetry?.latitude != null || telemetry?.lat != null);

  return (
    <div className={`relative bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm ${isFullscreen ? 'h-80' : 'h-52'}`}>
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        attributionControl={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {hasCoordinates && (
          <Marker position={[lat, lng]} icon={vehicleMarkerIcon}>
            <Popup>
              <div className="text-xs font-sans">
                <div className="font-bold text-slate-900">{vehicle?.licensePlate || 'My Vehicle'}</div>
                <div className="text-slate-500">{vehicle?.model}</div>
                {telemetry?.speed != null && (
                  <div className="text-blue-600 font-semibold mt-1">
                    Speed: {telemetry.speed.toFixed(1)} km/h
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}
        <RecenterAutomatically lat={lat} lng={lng} />
      </MapContainer>

      {/* Floating Status Pill */}
      <div className="absolute top-2.5 left-2.5 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live Position · {vehicle?.licensePlate || 'Vehicle'}</span>
      </div>

      {/* Fullscreen Toggle */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="absolute top-2.5 right-2.5 z-[400] w-9 h-9 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle map size"
        >
          <Icon name={isFullscreen ? 'Minimize2' : 'Maximize2'} size={16} />
        </button>
      )}

      {/* No Coordinates Warning */}
      {!hasCoordinates && (
        <div className="absolute inset-0 z-[400] bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center p-4 text-center">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <Icon name="NavigationOff" size={20} className="mx-auto text-amber-500" />
            <div className="font-bold">Awaiting Telemetry GPS Fix</div>
            <div className="text-[11px] text-slate-400">Position updates as soon as vehicle starts moving</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverMiniMap;
