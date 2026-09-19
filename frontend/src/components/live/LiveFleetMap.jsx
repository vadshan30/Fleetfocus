import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
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

const createVehicleIcon = (status, isDark) => {
  const colors = {
    AVAILABLE: isDark ? '#34d399' : '#10b981',
    ON_TRIP: isDark ? '#60a5fa' : '#3b82f6',
    MAINTENANCE: isDark ? '#fbbf24' : '#f59e0b',
    UNDER_MAINTENANCE: isDark ? '#fbbf24' : '#f59e0b',
  };

  const color = colors[status] || colors.AVAILABLE;

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

const MarkerLayer = ({ vehicles, isDark }) => {
  const map = useMap();
  const markersRef = useRef(new Map());

  useEffect(() => {
    vehicles.forEach((vehicle) => {
      const key = vehicle.vehicleId;
      const existingMarker = markersRef.current.get(key);
      const position = [vehicle.lat, vehicle.lng];

      if (existingMarker) {
        existingMarker.setLatLng(position);
        existingMarker.setIcon(createVehicleIcon(vehicle.status, isDark));
        existingMarker.getPopup()?.setContent(getPopupContent(vehicle, isDark));
      } else {
        const marker = L.marker(position, {
          icon: createVehicleIcon(vehicle.status, isDark),
        })
          .bindPopup(getPopupContent(vehicle, isDark))
          .addTo(map);
        markersRef.current.set(key, marker);
      }
    });

    markersRef.current.forEach((marker, key) => {
      if (!vehicles.some((v) => v.vehicleId === key)) {
        map.removeLayer(marker);
        markersRef.current.delete(key);
      }
    });
  }, [vehicles, map, isDark]);

  return null;
};

const getPopupContent = (vehicle, isDark) => {
  const bgColor = isDark ? '#1e293b' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';

  return `
    <div style="min-width: 180px; font-family: system-ui; background: ${bgColor}; color: ${textColor};">
      <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid ${borderColor};">
        <div style="font-weight: 600; font-size: 14px;">${vehicle.licensePlate}</div>
        <span style="font-size: 11px; padding: 2px 6px; border-radius: 9999px; background: ${isDark ? '#334155' : '#f1f5f9'}; color: ${mutedColor};">${vehicle.status}</span>
      </div>
      <div style="padding: 8px 12px; display: grid; gap: 6px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
          <span style="color: ${mutedColor};">Speed</span>
          <span style="font-weight: 600;">${vehicle.speed} km/h</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
          <span style="color: ${mutedColor};">Fuel</span>
          <span style="font-weight: 600; color: ${vehicle.fuelLevel < 15 ? (isDark ? '#f87171' : '#ef4444') : vehicle.fuelLevel < 40 ? (isDark ? '#fbbf24' : '#f59e0b') : (isDark ? '#34d399' : '#10b981')}">${vehicle.fuelLevel}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
          <span style="color: ${mutedColor};">Engine Temp</span>
          <span style="font-weight: 600; color: ${vehicle.engineTemp > 100 ? (isDark ? '#f87171' : '#ef4444') : 'inherit'}">${vehicle.engineTemp}°C</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: ${mutedColor}; padding-top: 4px; border-top: 1px solid ${borderColor};">
          <span>Lat: ${vehicle.lat?.toFixed(4) || 'N/A'}</span>
          <span>Lng: ${vehicle.lng?.toFixed(4) || 'N/A'}</span>
        </div>
      </div>
    </div>
  `;
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

const LiveFleetMap = ({ vehicles, isDark }) => {
  const [mapCenter, setMapCenter] = useState([39.8283, -98.5795]);
  const [mapZoom, setMapZoom] = useState(4);

  useEffect(() => {
    if (vehicles.length > 0) {
      const validVehicles = vehicles.filter((v) => v.lat && v.lng);
      if (validVehicles.length > 0) {
        const avgLat = validVehicles.reduce((sum, v) => sum + v.lat, 0) / validVehicles.length;
        const avgLng = validVehicles.reduce((sum, v) => sum + v.lng, 0) / validVehicles.length;
        setMapCenter([avgLat, avgLng]);
        setMapZoom(validVehicles.length === 1 ? 12 : 5);
      }
    }
  }, [vehicles]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapTileLayer isDark={isDark} />
        <MarkerLayer vehicles={vehicles} isDark={isDark} />
      </MapContainer>
    </div>
  );
};

export default LiveFleetMap;