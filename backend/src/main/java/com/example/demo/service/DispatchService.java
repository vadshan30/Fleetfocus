package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class DispatchService {

    private final TripRepository tripRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    @Autowired
    public DispatchService(TripRepository tripRepository, VehicleRepository vehicleRepository,
                           DriverRepository driverRepository) {
        this.tripRepository = tripRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
    }

    @Transactional
    public Trip createTrip(Long vehicleId, Long driverId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new BusinessValidationException("Vehicle not found with id: " + vehicleId));
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new BusinessValidationException("Driver not found with id: " + driverId));
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new BusinessValidationException("Vehicle is not available for dispatch");
        }
        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new BusinessValidationException("Driver is not available for dispatch");
        }
        vehicle.setStatus(VehicleStatus.ON_TRIP);
        vehicleRepository.save(vehicle);
        driver.setStatus(DriverStatus.ON_TRIP);
        driverRepository.save(driver);
        Trip trip = new Trip(vehicle, driver, LocalDateTime.now(), TripStatus.IN_PROGRESS);
        return tripRepository.save(trip);
    }

    @Transactional
    public Trip endTrip(Long tripId, Double finalDistance) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new BusinessValidationException("Trip not found with id: " + tripId));
        if (trip.getStatus() != TripStatus.IN_PROGRESS) {
            throw new BusinessValidationException("Trip is not in progress");
        }
        trip.setEndTime(LocalDateTime.now());
        trip.setStatus(TripStatus.COMPLETED);
        trip.setDistanceCovered(finalDistance != null ? finalDistance : 0.0);
        Trip savedTrip = tripRepository.save(trip);
        Vehicle vehicle = trip.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        if (finalDistance != null && vehicle.getCurrentMileage() != null) {
            vehicle.setCurrentMileage(vehicle.getCurrentMileage() + finalDistance);
        }
        vehicleRepository.save(vehicle);
        Driver driver = trip.getDriver();
        driver.setStatus(DriverStatus.AVAILABLE);
        driverRepository.save(driver);
        return savedTrip;
    }
}