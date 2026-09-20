package com.example.demo.service;

import com.example.demo.entity.AlertHistory;
import com.example.demo.entity.AlertSeverity;
import com.example.demo.entity.AlertType;
import com.example.demo.entity.Geofence;
import com.example.demo.entity.GeofenceEventType;
import com.example.demo.entity.TelemetryData;
import com.example.demo.repository.AlertHistoryRepository;
import com.example.demo.repository.GeofenceRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class GeofenceService {

    private final GeofenceRepository geofenceRepository;
    private final AlertHistoryRepository alertHistoryRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<Long, Set<Long>> vehicleInsideGeofences = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> lastAlertTime = new ConcurrentHashMap<>();
    private static final int DEBOUNCE_SECONDS = 60;
    private static final double EARTH_RADIUS_METERS = 6371000;

    public GeofenceService(GeofenceRepository geofenceRepository,
                           AlertHistoryRepository alertHistoryRepository,
                           SimpMessagingTemplate messagingTemplate) {
        this.geofenceRepository = geofenceRepository;
        this.alertHistoryRepository = alertHistoryRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<Geofence> getAllGeofences() {
        return geofenceRepository.findAll();
    }

    public List<Geofence> getActiveGeofences() {
        return geofenceRepository.findByActiveTrue();
    }

    public Geofence getGeofenceById(Long id) {
        return geofenceRepository.findById(id).orElse(null);
    }

    public Geofence createGeofence(Geofence geofence) {
        return geofenceRepository.save(geofence);
    }

    public Geofence updateGeofence(Long id, Geofence updated) {
        Geofence existing = geofenceRepository.findById(id).orElse(null);
        if (existing == null) return null;
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setCenterLat(updated.getCenterLat());
        existing.setCenterLng(updated.getCenterLng());
        existing.setRadiusMeters(updated.getRadiusMeters());
        existing.setType(updated.getType());
        existing.setColor(updated.getColor());
        existing.setActive(updated.getActive());
        return geofenceRepository.save(existing);
    }

    public void deactivateGeofence(Long id) {
        Geofence existing = geofenceRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setActive(false);
            geofenceRepository.save(existing);
        }
    }

    public void evaluateGeofences(TelemetryData telemetry) {
        if (telemetry.getLatitude() == null || telemetry.getLongitude() == null) {
            return;
        }

        Long vehicleId = telemetry.getVehicle().getId();
        List<Geofence> activeGeofences = getActiveGeofences();

        if (activeGeofences.isEmpty()) {
            return;
        }

        Set<Long> currentlyInside = vehicleInsideGeofences.computeIfAbsent(vehicleId, k -> ConcurrentHashMap.newKeySet());

        for (Geofence geofence : activeGeofences) {
            double distance = haversineDistance(
                    telemetry.getLatitude(), telemetry.getLongitude(),
                    geofence.getCenterLat(), geofence.getCenterLng()
            );

            boolean isInside = distance <= geofence.getRadiusMeters();
            boolean wasInside = currentlyInside.contains(geofence.getId());

            if (isInside && !wasInside) {
                handleGeofenceEvent(vehicleId, geofence, telemetry.getVehicle().getLicensePlate(), GeofenceEventType.ENTER);
                currentlyInside.add(geofence.getId());
            } else if (!isInside && wasInside) {
                handleGeofenceEvent(vehicleId, geofence, telemetry.getVehicle().getLicensePlate(), GeofenceEventType.EXIT);
                currentlyInside.remove(geofence.getId());
            }
        }
    }

    private void handleGeofenceEvent(Long vehicleId, Geofence geofence, String licensePlate, GeofenceEventType eventType) {
        String alertKey = vehicleId + ":" + geofence.getId() + ":" + eventType.name();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastTime = lastAlertTime.get(alertKey);

        if (lastTime != null && lastTime.plusSeconds(DEBOUNCE_SECONDS).isAfter(now)) {
            return;
        }

        lastAlertTime.put(alertKey, now);

        String message = String.format("Vehicle %s %s geofence '%s'",
                licensePlate,
                eventType == GeofenceEventType.ENTER ? "entered" : "exited",
                geofence.getName());

        AlertHistory history = new AlertHistory(vehicleId, AlertType.GEOFENCE_ENTER, AlertSeverity.INFO, message);
        history.setGeofenceId(geofence.getId());
        history.setGeofenceName(geofence.getName());
        history.setAlertType(eventType == GeofenceEventType.ENTER ? AlertType.GEOFENCE_ENTER : AlertType.GEOFENCE_EXIT);
        alertHistoryRepository.save(history);

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "GEOFENCE_" + eventType.name());
        payload.put("vehicleId", vehicleId.toString());
        payload.put("licensePlate", licensePlate);
        payload.put("geofenceId", geofence.getId().toString());
        payload.put("geofenceName", geofence.getName());
        payload.put("eventType", eventType.name());
        payload.put("message", message);
        payload.put("severity", "info");
        payload.put("timestamp", now.toString());

        messagingTemplate.convertAndSend("/topic/alerts", payload);
    }

    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }
}