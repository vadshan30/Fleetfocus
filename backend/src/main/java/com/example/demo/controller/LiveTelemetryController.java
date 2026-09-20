package com.example.demo.controller;

import com.example.demo.entity.TelemetryData;
import com.example.demo.entity.Vehicle;
import com.example.demo.repository.TelemetryDataRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
public class LiveTelemetryController {

    private final VehicleRepository vehicleRepository;
    private final TelemetryDataRepository telemetryDataRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, Long> lastAlertTime = new ConcurrentHashMap<>();
    private static final long ALERT_COOLDOWN_MS = 30000;

    public LiveTelemetryController(VehicleRepository vehicleRepository,
                                   TelemetryDataRepository telemetryDataRepository,
                                   SimpMessagingTemplate messagingTemplate) {
        this.vehicleRepository = vehicleRepository;
        this.telemetryDataRepository = telemetryDataRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedRate = 2000)
    public void broadcastTelemetry() {
        List<Vehicle> vehicles = vehicleRepository.findAll();

        for (Vehicle vehicle : vehicles) {
            List<TelemetryData> telemetryList = telemetryDataRepository
                    .findByVehicleOrderByRecordedAtDesc(vehicle);

            if (telemetryList.isEmpty()) {
                continue;
            }

            TelemetryData latest = telemetryList.get(0);

            Map<String, Object> payload = new HashMap<>();
            payload.put("vehicleId", vehicle.getId().toString());
            payload.put("licensePlate", vehicle.getLicensePlate());
            payload.put("lat", latest.getLatitude());
            payload.put("lng", latest.getLongitude());
            payload.put("speed", latest.getSpeed());
            payload.put("fuelLevel", latest.getFuelLevel());
            payload.put("engineTemp", latest.getEngineTemp());
            payload.put("status", vehicle.getStatus().name());
            payload.put("timestamp", Instant.now().toString());

            messagingTemplate.convertAndSend("/topic/telemetry", payload);

            evaluateAndBroadcastAlerts(vehicle, latest);
        }
    }

    private void evaluateAndBroadcastAlerts(Vehicle vehicle, TelemetryData telemetry) {
        String vehicleId = vehicle.getId().toString();
        String licensePlate = vehicle.getLicensePlate();
        long now = System.currentTimeMillis();

        checkAndBroadcastAlert(vehicleId, licensePlate, "SPEED",
                telemetry.getSpeed() > 90,
                "Vehicle exceeding speed limit: " + telemetry.getSpeed().intValue() + " km/h",
                "warning", now);

        checkAndBroadcastAlert(vehicleId, licensePlate, "FUEL",
                telemetry.getFuelLevel() < 15,
                "Low fuel level: " + telemetry.getFuelLevel().intValue() + "%",
                "critical", now);

        checkAndBroadcastAlert(vehicleId, licensePlate, "ENGINE_TEMP",
                telemetry.getEngineTemp() > 100,
                "High engine temperature: " + telemetry.getEngineTemp().intValue() + "°C",
                "critical", now);
    }

    private void checkAndBroadcastAlert(String vehicleId, String licensePlate,
                                        String type, boolean condition,
                                        String message, String severity, long now) {
        if (!condition) {
            return;
        }

        String alertKey = vehicleId + ":" + type;
        Long lastTime = lastAlertTime.get(alertKey);

        if (lastTime != null && (now - lastTime) < ALERT_COOLDOWN_MS) {
            return;
        }

        lastAlertTime.put(alertKey, now);

        Map<String, Object> alert = new HashMap<>();
        alert.put("type", type);
        alert.put("vehicleId", vehicleId);
        alert.put("licensePlate", licensePlate);
        alert.put("message", message);
        alert.put("severity", severity);
        alert.put("timestamp", Instant.now().toString());

        messagingTemplate.convertAndSend("/topic/alerts", alert);
    }
}