package com.example.demo.service;

import com.example.demo.entity.Driver;
import com.example.demo.entity.DriverStatus;
import com.example.demo.entity.Trip;
import com.example.demo.entity.TripStatus;
import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DriverRepository;
import com.example.demo.repository.TripRepository;
import com.example.demo.repository.VehicleRepository;
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
        trip.setStartTime(LocalDateTime.now());
        trip.setStatus(TripStatus.IN_PROGRESS);
        trip.setDistanceCovered(0.0);

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
        vehicle.setCurrentMileage(vehicle.getCurrentMileage() + distance);
        vehicleRepository.save(vehicle);

        Driver driver = trip.getDriver();
        driver.setStatus(DriverStatus.AVAILABLE);
        driverRepository.save(driver);

        trip.setEndTime(LocalDateTime.now());
        trip.setStatus(TripStatus.COMPLETED);
        trip.setDistanceCovered(distance);

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

        trip.setStatus(TripStatus.CANCELLED);
        trip.setEndTime(LocalDateTime.now());

        return tripRepository.save(trip);
    }

    public Trip scheduleTrip(Long vehicleId, Long driverId, LocalDateTime scheduledTime) {
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
        trip.setDistanceCovered(0.0);

        if (scheduledTime.isBefore(LocalDateTime.now())) {
            trip.setStatus(TripStatus.IN_PROGRESS);
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
}