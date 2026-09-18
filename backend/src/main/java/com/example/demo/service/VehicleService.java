package com.example.demo.service;

import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final TelemetryDataRepository telemetryDataRepository;
    private final TripRepository tripRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final AlertRepository alertRepository;

    @Autowired
    public VehicleService(VehicleRepository vehicleRepository,
                          TelemetryDataRepository telemetryDataRepository,
                          TripRepository tripRepository,
                          MaintenanceLogRepository maintenanceLogRepository,
                          AlertRepository alertRepository) {
        this.vehicleRepository = vehicleRepository;
        this.telemetryDataRepository = telemetryDataRepository;
        this.tripRepository = tripRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.alertRepository = alertRepository;
    }

    public Page<Vehicle> getAllVehicles(Pageable pageable) {
        return vehicleRepository.findAll(pageable);
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        if (vehicle.getStatus() == null) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }
        if (vehicle.getCurrentMileage() == null) {
            vehicle.setCurrentMileage(0.0);
        }
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, Vehicle vehicleDetails) {
        Vehicle existingVehicle = getVehicleById(id);
        existingVehicle.setVin(vehicleDetails.getVin());
        existingVehicle.setLicensePlate(vehicleDetails.getLicensePlate());
        existingVehicle.setModel(vehicleDetails.getModel());
        existingVehicle.setStatus(vehicleDetails.getStatus());
        existingVehicle.setCurrentMileage(vehicleDetails.getCurrentMileage());
        return vehicleRepository.save(existingVehicle);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = getVehicleById(id);
        
        telemetryDataRepository.deleteByVehicle(vehicle);
        tripRepository.deleteByVehicle(vehicle);
        maintenanceLogRepository.deleteByVehicle(vehicle);
        alertRepository.deleteByVehicle(vehicle);
        
        vehicleRepository.delete(vehicle);
    }
}