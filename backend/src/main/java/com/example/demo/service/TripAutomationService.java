package com.example.demo.service;

import com.example.demo.entity.Driver;
import com.example.demo.entity.DriverStatus;
import com.example.demo.entity.TelemetryData;
import com.example.demo.entity.Trip;
import com.example.demo.entity.TripStatus;
import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleStatus;
import com.example.demo.repository.DriverRepository;
import com.example.demo.repository.TripRepository;
import com.example.demo.repository.VehicleRepository;
import com.example.demo.util.GeoUtils;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class TripAutomationService {

    private static final double DISTANCE_THRESHOLD_METERS = 100.0;
    private static final double MIN_SPEED_KMH = 5.0;
    private static final int DELAY_GRACE_MINUTES = 5;
    private static final int DEBOUNCE_SECONDS = 30;

    private final TripRepository tripRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, LocalDateTime> lastBroadcastTime = new ConcurrentHashMap<>();

    public TripAutomationService(TripRepository tripRepository,
                                 VehicleRepository vehicleRepository,
                                 DriverRepository driverRepository,
                                 SimpMessagingTemplate messagingTemplate) {
        this.tripRepository = tripRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Trip evaluateTrip(TelemetryData telemetry, Trip trip) {
        if (trip == null || telemetry == null) {
            return trip;
        }

        TripStatus status = trip.getStatus();
        if (status == TripStatus.COMPLETED || status == TripStatus.CANCELLED) {
            return trip;
        }

        Double lat = telemetry.getLatitude();
        Double lng = telemetry.getLongitude();
        if (lat == null || lng == null) {
            return trip;
        }

        LocalDateTime now = LocalDateTime.now();

        // 1. Auto-START logic
        if (status == TripStatus.SCHEDULED) {
            if (trip.getOriginLat() != null && trip.getOriginLng() != null) {
                double distanceFromOrigin = GeoUtils.haversineMeters(
                        lat, lng,
                        trip.getOriginLat(), trip.getOriginLng()
                );

                if (distanceFromOrigin > DISTANCE_THRESHOLD_METERS) {
                    trip.setStatus(TripStatus.IN_PROGRESS);
                    trip.setActualStartTime(now);
                    if (trip.getStartTime() == null) {
                        trip.setStartTime(now);
                    }

                    // Update vehicle and driver status to ON_TRIP
                    Vehicle vehicle = trip.getVehicle();
                    if (vehicle != null && vehicle.getStatus() != VehicleStatus.ON_TRIP) {
                        vehicle.setStatus(VehicleStatus.ON_TRIP);
                        vehicleRepository.save(vehicle);
                    }
                    Driver driver = trip.getDriver();
                    if (driver != null && driver.getStatus() != DriverStatus.ON_TRIP) {
                        driver.setStatus(DriverStatus.ON_TRIP);
                        driverRepository.save(driver);
                    }

                    broadcastTripEvent("TRIP_STARTED", trip, null);
                }
            }
        }

        // 2. Auto-COMPLETE logic
        if (trip.getStatus() == TripStatus.IN_PROGRESS) {
            if (trip.getDestinationLat() != null && trip.getDestinationLng() != null) {
                double distanceToDestination = GeoUtils.haversineMeters(
                        lat, lng,
                        trip.getDestinationLat(), trip.getDestinationLng()
                );

                if (distanceToDestination <= DISTANCE_THRESHOLD_METERS) {
                    trip.setStatus(TripStatus.COMPLETED);
                    trip.setActualEndTime(now);
                    trip.setEndTime(now);

                    // Free vehicle and driver
                    Vehicle vehicle = trip.getVehicle();
                    if (vehicle != null) {
                        vehicle.setStatus(VehicleStatus.AVAILABLE);
                        vehicleRepository.save(vehicle);
                    }
                    Driver driver = trip.getDriver();
                    if (driver != null) {
                        driver.setStatus(DriverStatus.AVAILABLE);
                        driverRepository.save(driver);
                    }

                    broadcastTripEvent("TRIP_COMPLETED", trip, null);
                    return tripRepository.save(trip);
                }
            }
        }

        // 3. Live ETA calculation & Delay detection (for IN_PROGRESS trips)
        if (trip.getStatus() == TripStatus.IN_PROGRESS && trip.getDestinationLat() != null && trip.getDestinationLng() != null) {
            double remainingKm = GeoUtils.haversineKm(
                    lat, lng,
                    trip.getDestinationLat(), trip.getDestinationLng()
            );

            Double speed = telemetry.getSpeed();
            if (speed != null && speed > MIN_SPEED_KMH) {
                double etaMinutes = (remainingKm / speed) * 60.0;
                LocalDateTime eta = now.plusMinutes((long) Math.round(etaMinutes));
                trip.setEstimatedArrivalTime(eta);
            } else {
                trip.setEstimatedArrivalTime(null);
            }

            // Delay detection
            LocalDateTime scheduledEnd = trip.getScheduledEndTime() != null ? trip.getScheduledEndTime() : trip.getEndTime();
            if (trip.getEstimatedArrivalTime() != null && scheduledEnd != null) {
                LocalDateTime thresholdTime = scheduledEnd.plusMinutes(DELAY_GRACE_MINUTES);
                if (trip.getEstimatedArrivalTime().isAfter(thresholdTime)) {
                    long minutesBetween = Duration.between(scheduledEnd, trip.getEstimatedArrivalTime()).toMinutes();
                    int delayMinutes = (int) Math.max(0, minutesBetween);

                    Integer previousDelay = trip.getDelayMinutes();
                    if (previousDelay == null || delayMinutes > previousDelay) {
                        Map<String, Object> extra = new HashMap<>();
                        extra.put("delayMinutes", delayMinutes);
                        broadcastTripEvent("TRIP_DELAYED", trip, extra);
                    }
                    trip.setDelayMinutes(delayMinutes);
                } else {
                    trip.setDelayMinutes(0);
                }
            }
        }

        return tripRepository.save(trip);
    }

    private void broadcastTripEvent(String eventType, Trip trip, Map<String, Object> extra) {
        String debounceKey = trip.getId() + ":" + eventType;
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastTime = lastBroadcastTime.get(debounceKey);

        if (lastTime != null && lastTime.plusSeconds(DEBOUNCE_SECONDS).isAfter(now)) {
            return;
        }

        lastBroadcastTime.put(debounceKey, now);

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", eventType);
        payload.put("tripId", trip.getId());
        payload.put("status", trip.getStatus().name());
        payload.put("timestamp", now.toString());

        if (trip.getVehicle() != null) {
            payload.put("vehicleId", trip.getVehicle().getId());
            payload.put("licensePlate", trip.getVehicle().getLicensePlate());
        }

        if (trip.getDriver() != null) {
            payload.put("driverId", trip.getDriver().getId());
            String driverName = trip.getDriver().getUser() != null ? trip.getDriver().getUser().getUsername() : "Driver #" + trip.getDriver().getId();
            payload.put("driverName", driverName);
        }

        if (trip.getActualStartTime() != null) {
            payload.put("actualStartTime", trip.getActualStartTime().toString());
        }
        if (trip.getActualEndTime() != null) {
            payload.put("actualEndTime", trip.getActualEndTime().toString());
        }
        if (trip.getEstimatedArrivalTime() != null) {
            payload.put("estimatedArrivalTime", trip.getEstimatedArrivalTime().toString());
        }
        if (trip.getDelayMinutes() != null) {
            payload.put("delayMinutes", trip.getDelayMinutes());
        }

        if (extra != null) {
            payload.putAll(extra);
        }

        messagingTemplate.convertAndSend("/topic/trips", payload);
    }
}
