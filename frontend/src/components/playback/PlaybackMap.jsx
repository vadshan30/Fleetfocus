import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const getStatusColor = (status, isDark) => {
  const colors = {
    AVAILABLE: isDark ? '#34d399' : '#10b981',
    ON_TRIP: isDark ? '#60a5fa' : '#3b82f6',
    MAINTENANCE: isDark ? '#fbbf24' : '#f59e0b',
    UNDER_MAINTENANCE: isDark ? '#fbbf24' : '#f59e0b',
  };
  return colors[status] || colors.AVAILABLE;
};

const createVehicleIcon = (status, isDark) => {
  const color = getStatusColor(status, isDark);
  return L.divIcon({
    className: 'vehicle-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid ${isDark ? '#1e293b' : '#ffffff'};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const MapTileLayer = ({ isDark }) => {
  const url = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = isDark
    ? '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
    : '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>';

  return <TileLayer url={url} attribution={attribution} />;
};

const MapRecenter = ({ vehicles }) => {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (!hasCentered.current && vehicles.length > 0) {
      const validVehicles = vehicles.filter((v) => v.lat && v.lng);
      if (validVehicles.length > 0) {
        const avgLat = validVehicles.reduce((sum, v) => sum + v.lat, 0) / validVehicles.length;
        const avgLng = validVehicles.reduce((sum, v) => sum + v.lng, 0) / validVehicles.length;
        map.setView([avgLat, avgLng], validVehicles.length === 1 ? 12 : 5);
        hasCentered.current = true;
      }
    }
  }, [vehicles, map]);

  return null;
};

const PlaybackMap = ({ vehicles = [], trails = {}, showTrails = true, isDark = false }) => {
  const [mapCenter] = useState([39.8283, -98.5795]);
  const [mapZoom] = useState(4);

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 relative shadow-sm">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapTileLayer isDark={isDark} />
        <MapRecenter vehicles={vehicles} />

        {/* Trail lines */}
        {showTrails &&
          Object.entries(trails).map(([vehicleId, points]) => {
            if (!points || points.length < 2) return null;
            const currentVehicle = vehicles.find((v) => String(v.vehicleId) === String(vehicleId));
            const status = currentVehicle?.status || 'AVAILABLE';
            const color = getStatusColor(status, isDark);
            const latLngs = points.map((p) => [p.lat, p.lng]);

            return (
              <Polyline
                key={`trail-${vehicleId}`}
                positions={latLngs}
                pathOptions={{
                  color,
                  weight: 3,
                  opacity: 0.7,
                  dashArray: '5, 5',
                }}
              />
            );
          })}

        {/* Vehicle markers */}
        {vehicles.map((vehicle) => {
          if (!vehicle.lat || !vehicle.lng) return null;
          const position = [vehicle.lat, vehicle.lng];
          const icon = createVehicleIcon(vehicle.status, isDark);
          const statusColor = getStatusColor(vehicle.status, isDark);

          return (
            <Marker key={vehicle.vehicleId} position={position} icon={icon}>
              <Popup>
                <div className="min-w-[180px] p-1 font-sans text-slate-800 dark:text-slate-100">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="font-bold text-sm">{vehicle.licensePlate}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{vehicle.model}</div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${statusColor}22`,
                        color: statusColor,
                      }}
                    >
                      {vehicle.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Speed:</span>
                      <span className="font-semibold">{vehicle.speed != null ? `${Math.round(vehicle.speed)} km/h` : '0 km/h'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Fuel Level:</span>
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            vehicle.fuelLevel < 15
                              ? '#ef4444'
                              : vehicle.fuelLevel < 40
                              ? '#f59e0b'
                              : '#10b981',
                        }}
                      >
                        {vehicle.fuelLevel != null ? `${Math.round(vehicle.fuelLevel)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Engine Temp:</span>
                      <span
                        className="font-semibold"
                        style={{
                          color: vehicle.engineTemp > 100 ? '#ef4444' : 'inherit',
                        }}
                      >
                        {vehicle.engineTemp != null ? `${Math.round(vehicle.engineTemp)}°C` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                      <span>Time:</span>
                      <span>{formatTime(vehicle.recordedAt)}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PlaybackMap;
