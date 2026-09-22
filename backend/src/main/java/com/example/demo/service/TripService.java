package com.example.demo.service;

import com.example.demo.dto.TripEtaDto;
import com.example.demo.entity.Driver;
import com.example.demo.entity.DriverStatus;
import com.example.demo.entity.TelemetryData;
import com.example.demo.entity.Trip;
import com.example.demo.entity.TripStatus;
import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DriverRepository;
import com.example.demo.repository.TelemetryDataRepository;
import com.example.demo.repository.TripRepository;
import com.example.demo.repository.VehicleRepository;
import com.example.demo.util.GeoUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private TelemetryDataRepository telemetryDataRepository;

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public List<Trip> getAllTripsForUser(String username) {
        return tripRepository.findAll();
    }

    public List<Trip> getTripsByDriverUsername(String username) {
        return tripRepository.findByDriverUsername(username);
    }

    public Trip getTripById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
    }

    public Trip startTrip(Long vehicleId, Long driverId) {
        return startTrip(vehicleId, driverId, null, null, null, null, null);
    }

    public Trip startTrip(Long vehicleId, Long driverId,
                         Double originLat, Double originLng,
                         Double destinationLat, Double destinationLng,
                         LocalDateTime scheduledEndTime) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new IllegalStateException("Vehicle is not available");
        }

        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new IllegalStateException("Driver is not available");
        }

        vehicle.setStatus(VehicleStatus.ON_TRIP);
        vehicleRepository.save(vehicle);

        driver.setStatus(DriverStatus.ON_TRIP);
        driverRepository.save(driver);

        LocalDateTime now = LocalDateTime.now();
        Trip trip = new Trip();
        trip.setVehicle(vehicle);
        trip.setDriver(driver);
        trip.setStartTime(now);
        trip.setActualStartTime(now);
        trip.setScheduledStartTime(now);
        trip.setScheduledEndTime(scheduledEndTime != null ? scheduledEndTime : now.plusHours(2));
        trip.setStatus(TripStatus.IN_PROGRESS);
        trip.setDistanceCovered(0.0);
        trip.setOriginLat(originLat);
        trip.setOriginLng(originLng);
        trip.setDestinationLat(destinationLat);
        trip.setDestinationLng(destinationLng);
        trip.setDelayMinutes(0);

        return tripRepository.save(trip);
    }

    public Trip endTrip(Long tripId, Double distance) {
        Trip trip = getTripById(tripId);

        if (trip.getStatus() == TripStatus.COMPLETED) {
            throw new IllegalStateException("Trip is already completed");
        }

        if (trip.getStatus() == TripStatus.CANCELLED) {
            throw new IllegalStateException("Cannot end a cancelled trip");
        }

        Vehicle vehicle = trip.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicle.setCurrentMileage(vehicle.getCurrentMileage() + (distance != null ? distance : 0.0));
        vehicleRepository.save(vehicle);

        Driver driver = trip.getDriver();
        driver.setStatus(DriverStatus.AVAILABLE);
        driverRepository.save(driver);

        LocalDateTime now = LocalDateTime.now();
        trip.setEndTime(now);
        trip.setActualEndTime(now);
        trip.setStatus(TripStatus.COMPLETED);
        trip.setDistanceCovered(distance != null ? distance : 0.0);

        return tripRepository.save(trip);
    }

    public Trip cancelTrip(Long tripId) {
        Trip trip = getTripById(tripId);

        if (trip.getStatus() == TripStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed trip");
        }

        if (trip.getStatus() == TripStatus.CANCELLED) {
            throw new IllegalStateException("Trip is already cancelled");
        }

        Vehicle vehicle = trip.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(vehicle);

        Driver driver = trip.getDriver();
        driver.setStatus(DriverStatus.AVAILABLE);
        driverRepository.save(driver);

        LocalDateTime now = LocalDateTime.now();
        trip.setStatus(TripStatus.CANCELLED);
        trip.setEndTime(now);
        trip.setActualEndTime(now);

        return tripRepository.save(trip);
    }

    public Trip scheduleTrip(Long vehicleId, Long driverId, LocalDateTime scheduledTime) {
        return scheduleTrip(vehicleId, driverId, scheduledTime, null, null, null, null, null);
    }

    public Trip scheduleTrip(Long vehicleId, Long driverId, LocalDateTime scheduledTime,
                            Double originLat, Double originLng,
                            Double destinationLat, Double destinationLng,
                            LocalDateTime scheduledEndTime) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new IllegalStateException("Vehicle is not available");
        }

        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new IllegalStateException("Driver is not available");
        }

        vehicle.setStatus(VehicleStatus.ON_TRIP);
        vehicleRepository.save(vehicle);

        driver.setStatus(DriverStatus.ON_TRIP);
        driverRepository.save(driver);

        Trip trip = new Trip();
        trip.setVehicle(vehicle);
        trip.setDriver(driver);
        trip.setStartTime(scheduledTime);
        trip.setScheduledStartTime(scheduledTime);
        trip.setScheduledEndTime(scheduledEndTime != null ? scheduledEndTime : scheduledTime.plusHours(2));
        trip.setDistanceCovered(0.0);
        trip.setOriginLat(originLat);
        trip.setOriginLng(originLng);
        trip.setDestinationLat(destinationLat);
        trip.setDestinationLng(destinationLng);
        trip.setDelayMinutes(0);

        if (scheduledTime.isBefore(LocalDateTime.now())) {
            trip.setStatus(TripStatus.IN_PROGRESS);
            trip.setActualStartTime(LocalDateTime.now());
        } else {
            trip.setStatus(TripStatus.SCHEDULED);
        }

        return tripRepository.save(trip);
    }

    public List<Trip> getTripsByDriver(Long driverId) {
        return tripRepository.findByDriverId(driverId);
    }

    public List<Trip> getTripsByVehicle(Long vehicleId) {
        return tripRepository.findByVehicleId(vehicleId);
    }

    public double calculateRemainingKm(Trip trip, double currentLat, double currentLng) {
        if (trip == null || trip.getDestinationLat() == null || trip.getDestinationLng() == null) {
            return 0.0;
        }
        return GeoUtils.haversineKm(currentLat, currentLng, trip.getDestinationLat(), trip.getDestinationLng());
    }

    public double calculateEtaMinutes(double remainingKm, double speedKmh) {
        if (speedKmh <= 0.0) {
            return 0.0;
        }
        return (remainingKm / speedKmh) * 60.0;
    }

    public TripEtaDto getTripEta(Long tripId) {
        Trip trip = getTripById(tripId);
        Double remainingKm = null;

        if (trip.getDestinationLat() != null && trip.getDestinationLng() != null) {
            List<TelemetryData> telemetryList = telemetryDataRepository.findByVehicleOrderByRecordedAtDesc(trip.getVehicle());
            if (!telemetryList.isEmpty() && telemetryList.get(0).getLatitude() != null && telemetryList.get(0).getLongitude() != null) {
                TelemetryData latest = telemetryList.get(0);
                remainingKm = Math.round(calculateRemainingKm(trip, latest.getLatitude(), latest.getLongitude()) * 10.0) / 10.0;
            } else if (trip.getOriginLat() != null && trip.getOriginLng() != null) {
                remainingKm = Math.round(calculateRemainingKm(trip, trip.getOriginLat(), trip.getOriginLng()) * 10.0) / 10.0;
            }
        }

        return new TripEtaDto(
                trip.getEstimatedArrivalTime(),
                trip.getDelayMinutes() != null ? trip.getDelayMinutes() : 0,
                remainingKm,
                trip.getStatus()
        );
    }
}