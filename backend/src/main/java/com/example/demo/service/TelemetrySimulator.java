package com.example.demo.service;

import com.example.demo.entity.TelemetryData;
import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleStatus;
import com.example.demo.repository.TelemetryDataRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
@EnableScheduling
public class TelemetrySimulator {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private TelemetryDataRepository telemetryDataRepository;

    @Autowired
    private GeofenceService geofenceService;

    private final Random random = new Random();

    @Scheduled(fixedRate = 5000)
    public void generateTelemetry() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        
        for (Vehicle vehicle : vehicles) {
            // Generate telemetry for ALL vehicles, not just ON_TRIP
            TelemetryData telemetry = new TelemetryData();
            telemetry.setVehicle(vehicle);
            
            // Generate random GPS coordinates
            telemetry.setLatitude(-90 + random.nextDouble() * 180);
            telemetry.setLongitude(-180 + random.nextDouble() * 360);
            
            // Generate speed based on status
            double speed;
            if (vehicle.getStatus() == VehicleStatus.ON_TRIP) {
                speed = 20 + random.nextDouble() * 100; // 20-120 km/h
            } else if (vehicle.getStatus() == VehicleStatus.AVAILABLE) {
                speed = random.nextDouble() * 20; // 0-20 km/h (idle)
            } else {
                speed = random.nextDouble() * 10; // 0-10 km/h (maintenance)
            }
            telemetry.setSpeed(Math.round(speed * 10.0) / 10.0);
            
            // Generate fuel level (0-100%)
            double fuelLevel;
            if (vehicle.getStatus() == VehicleStatus.ON_TRIP) {
                fuelLevel = 10 + random.nextDouble() * 80; // 10-90%
            } else if (vehicle.getStatus() == VehicleStatus.AVAILABLE) {
                fuelLevel = 30 + random.nextDouble() * 60; // 30-90%
            } else {
                fuelLevel = 20 + random.nextDouble() * 50; // 20-70%
            }
            telemetry.setFuelLevel(Math.round(fuelLevel * 10.0) / 10.0);
            
            // Generate engine temperature (70-120°C)
            double engineTemp = 70 + random.nextDouble() * 50;
            telemetry.setEngineTemp(Math.round(engineTemp * 10.0) / 10.0);
            
            telemetry.setRecordedAt(LocalDateTime.now());
            
            telemetryDataRepository.save(telemetry);
            
            // Evaluate geofences for this telemetry
            geofenceService.evaluateGeofences(telemetry);
        }
        
        System.out.println("✅ Telemetry generated for " + vehicles.size() + " vehicles");
    }
}