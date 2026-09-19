import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const GeofenceLayer = ({ geofences, selectedGeofenceId, onGeofenceClick, isDark }) => {
  const map = useMap();
  const circlesRef = useRef(new Map());

  useEffect(() => {
    geofences.forEach((geofence) => {
      if (!geofence.active || !geofence.centerLat || !geofence.centerLng) return;

      const key = geofence.id;
      const existingCircle = circlesRef.current.get(key);
      const center = [geofence.centerLat, geofence.centerLng];
      const radius = geofence.radiusMeters;
      const color = geofence.color || '#3b82f6';

      if (existingCircle) {
        existingCircle.setLatLng(center);
        existingCircle.setRadius(radius);
        existingCircle.setStyle({ color, fillColor: color });
      } else {
        const circle = L.circle(center, {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.15,
          weight: 2,
          dashArray: geofence.id === selectedGeofenceId ? null : '5, 10',
          className: 'geofence-circle',
        })
          .bindPopup(`
            <div style="min-width: 150px; font-family: system-ui;">
              <div style="font-weight: 600; padding: 4px 8px;">${geofence.name}</div>
              <div style="font-size: 12px; color: #64748b; padding: 0 8px 8px;">
                Type: ${geofence.type}<br/>
                Radius: ${geofence.radiusMeters}m
              </div>
            </div>
          `)
          .on('click', () => onGeofenceClick(geofence))
          .addTo(map);
        circlesRef.current.set(key, circle);
      }
    });

    circlesRef.current.forEach((circle, key) => {
      if (!geofences.some((g) => g.id === key)) {
        map.removeLayer(circle);
        circlesRef.current.delete(key);
      }
    });
  }, [geofences, map, selectedGeofenceId, onGeofenceClick, isDark]);

  return null;
};

export default GeofenceLayer;