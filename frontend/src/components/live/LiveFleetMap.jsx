import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import GeofenceLayer from '../geofence/GeofenceLayer';
import Icon from '../ui/Icon';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const createVehicleIcon = (status, isDark, isSelected = false) => {
  const colors = {
    AVAILABLE: isDark ? '#34d399' : '#10b981',
    ON_TRIP: isDark ? '#60a5fa' : '#3b82f6',
    MAINTENANCE: isDark ? '#fbbf24' : '#f59e0b',
    UNDER_MAINTENANCE: isDark ? '#fbbf24' : '#f59e0b',
  };

  const color = colors[status] || colors.AVAILABLE;
  const shadow = isSelected
    ? '0 0 0 4px #3b82f6, 0 2px 14px rgba(59, 130, 246, 0.7)'
    : '0 2px 8px rgba(0,0,0,0.3)';

  return L.divIcon({
    className: `vehicle-marker ${isSelected ? 'selected' : ''}`,
    html: `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid ${isSelected ? '#3b82f6' : (isDark ? '#1e293b' : '#ffffff')};
        box-shadow: ${shadow};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
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

const MarkerLayer = ({ vehicles, isDark, selectedVehicleId, onSelectVehicle, pickMode }) => {
  const map = useMap();
  const markersRef = useRef(new Map());
  const prevSelectedIdRef = useRef(null);

  // Sync markers with vehicle stream
  useEffect(() => {
    vehicles.forEach((vehicle) => {
      const key = String(vehicle.vehicleId || vehicle.id);
      const isSelected = selectedVehicleId && String(selectedVehicleId) === key;
      const existingMarker = markersRef.current.get(key);
      const position = [vehicle.lat, vehicle.lng];

      if (existingMarker) {
        existingMarker.setLatLng(position);
        existingMarker.setIcon(createVehicleIcon(vehicle.status, isDark, isSelected));
        existingMarker.setZIndexOffset(isSelected ? 1000 : 0);
        existingMarker.getPopup()?.setContent(getPopupContent(vehicle, isDark));
      } else {
        const marker = L.marker(position, {
          icon: createVehicleIcon(vehicle.status, isDark, isSelected),
          zIndexOffset: isSelected ? 1000 : 0,
        })
          .bindPopup(getPopupContent(vehicle, isDark))
          .addTo(map);

        marker.on('click', (e) => {
          if (e.originalEvent) {
            e.originalEvent._stopped = true;
          }
          L.DomEvent.stopPropagation(e);
          if (!pickMode && onSelectVehicle) {
            onSelectVehicle(key);
          }
        });

        markersRef.current.set(key, marker);
      }
    });

    markersRef.current.forEach((marker, key) => {
      if (!vehicles.some((v) => String(v.vehicleId || v.id) === key)) {
        map.removeLayer(marker);
        markersRef.current.delete(key);
      }
    });
  }, [vehicles, map, isDark, selectedVehicleId, onSelectVehicle, pickMode]);

  // React to selection changes (flyTo + openPopup)
  useEffect(() => {
    const currentKey = selectedVehicleId ? String(selectedVehicleId) : null;
    const prevKey = prevSelectedIdRef.current ? String(prevSelectedIdRef.current) : null;

    if (currentKey && currentKey !== prevKey) {
      const marker = markersRef.current.get(currentKey);
      if (marker) {
        const latLng = marker.getLatLng();
        if (latLng && typeof latLng.lat === 'number' && typeof latLng.lng === 'number') {
          map.flyTo(latLng, Math.max(map.getZoom(), 14), {
            duration: 1.0,
            easeLinearity: 0.25,
          });
          marker.openPopup();
        }
      }
    } else if (!currentKey && prevKey) {
      const prevMarker = markersRef.current.get(prevKey);
      if (prevMarker && prevMarker.isPopupOpen()) {
        prevMarker.closePopup();
      }
    }

    prevSelectedIdRef.current = selectedVehicleId;
  }, [selectedVehicleId, map]);

  return null;
};

const PickModeHandler = ({ enabled, onPick }) => {
  useMapEvents({
    click: (e) => {
      if (enabled) {
        onPick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const MapClickDeselect = ({ enabled, onDeselect }) => {
  useMapEvents({
    click: (e) => {
      if (enabled && !e.originalEvent?._stopped) {
        onDeselect(null);
      }
    },
  });
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
          <span>Lat: ${typeof vehicle.lat === 'number' ? vehicle.lat.toFixed(4) : 'N/A'}</span>
          <span>Lng: ${typeof vehicle.lng === 'number' ? vehicle.lng.toFixed(4) : 'N/A'}</span>
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

const MapToolbar = ({ showGeofences, onToggleGeofences, onAddGeofence, isDark, pickMode }) => {
  const bgColor = isDark ? 'bg-slate-900/90' : 'bg-white/90';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const hoverBg = isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100';

  return (
    <div className={`absolute top-3 right-3 z-10 ${bgColor} backdrop-blur-sm rounded-xl border ${borderColor} shadow-lg p-2 flex flex-col gap-1`}>
      <button
        onClick={onToggleGeofences}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${hoverBg} ${showGeofences ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300' : `${textColor}`}`}
        title={showGeofences ? 'Hide geofences' : 'Show geofences'}
      >
        <Icon name="MapPin" size={16} />
        <span>Geofences</span>
        <span className={`w-2 h-2 rounded-full ${showGeofences ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      </button>
      <button
        onClick={onAddGeofence}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${hoverBg} ${pickMode ? 'bg-blue-600 text-white' : textColor}`}
        title={pickMode ? 'Exit pick mode' : 'Add geofence (click map to set center)'}
      >
        <Icon name={pickMode ? 'X' : 'Plus'} size={16} />
        <span>{pickMode ? 'Cancel Pick' : 'Add Geofence'}</span>
      </button>
      {pickMode && (
        <div className="px-2 py-1 text-xs text-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 rounded">
          Click on map to set geofence center...
        </div>
      )}
    </div>
  );
};

const LiveFleetMap = ({
  vehicles,
  geofences,
  isDark,
  showGeofences,
  onToggleGeofences,
  onAddGeofence,
  onSelectGeofence,
  selectedGeofenceId,
  selectedVehicleId,
  onSelectVehicle,
  pickMode,
  onPickCoordinates,
}) => {
  const [mapCenter, setMapCenter] = useState([39.8283, -98.5795]);
  const [mapZoom, setMapZoom] = useState(4);
  const initialCenteredRef = useRef(false);

  // Set initial map center once when vehicles first load, without overriding user panning/fly-to
  useEffect(() => {
    if (!initialCenteredRef.current && vehicles.length > 0) {
      const validVehicles = vehicles.filter((v) => typeof v.lat === 'number' && typeof v.lng === 'number');
      if (validVehicles.length > 0) {
        const avgLat = validVehicles.reduce((sum, v) => sum + v.lat, 0) / validVehicles.length;
        const avgLng = validVehicles.reduce((sum, v) => sum + v.lng, 0) / validVehicles.length;
        setMapCenter([avgLat, avgLng]);
        setMapZoom(validVehicles.length === 1 ? 12 : 5);
        initialCenteredRef.current = true;
      }
    }
  }, [vehicles]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapTileLayer isDark={isDark} />
        <MarkerLayer
          vehicles={vehicles}
          isDark={isDark}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={onSelectVehicle}
          pickMode={pickMode}
        />
        {showGeofences && (
          <GeofenceLayer
            geofences={geofences}
            selectedGeofenceId={selectedGeofenceId}
            onGeofenceClick={onSelectGeofence}
            isDark={isDark}
          />
        )}
        <PickModeHandler enabled={pickMode} onPick={onPickCoordinates} />
        <MapClickDeselect enabled={!pickMode} onDeselect={onSelectVehicle} />
      </MapContainer>
      <MapToolbar
        showGeofences={showGeofences}
        onToggleGeofences={onToggleGeofences}
        onAddGeofence={onAddGeofence}
        isDark={isDark}
        pickMode={pickMode}
      />
    </div>
  );
};

export default LiveFleetMap;