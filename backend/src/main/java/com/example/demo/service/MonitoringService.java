package com.example.demo.service;

import com.example.demo.entity.TelemetryData;
import com.example.demo.entity.Vehicle;
import com.example.demo.repository.TelemetryDataRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MonitoringService {

    private final VehicleRepository vehicleRepository;
    private final TelemetryDataRepository telemetryDataRepository;

    @Autowired
    public MonitoringService(VehicleRepository vehicleRepository,
                             TelemetryDataRepository telemetryDataRepository) {
        this.vehicleRepository = vehicleRepository;
        this.telemetryDataRepository = telemetryDataRepository;
    }

    public List<Map<String, Object>> getLiveFleetStatus() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<Map<String, Object>> fleetStatus = new ArrayList<>();
        for (Vehicle vehicle : vehicles) {
            Map<String, Object> status = new HashMap<>();
            status.put("vehicleId", vehicle.getId());
            status.put("licensePlate", vehicle.getLicensePlate());
            status.put("model", vehicle.getModel());
            status.put("status", vehicle.getStatus().name());
            List<TelemetryData> telemetryList = telemetryDataRepository
                    .findByVehicleOrderByRecordedAtDesc(vehicle);
            if (!telemetryList.isEmpty()) {
                TelemetryData latest = telemetryList.get(0);
                status.put("lat", latest.getLatitude());
                status.put("lng", latest.getLongitude());
                status.put("latitude", latest.getLatitude());
                status.put("longitude", latest.getLongitude());
                status.put("speed", latest.getSpeed());
                status.put("fuelLevel", latest.getFuelLevel());
                status.put("engineTemp", latest.getEngineTemp());
            } else {
                status.put("lat", 0.0);
                status.put("lng", 0.0);
                status.put("latitude", 0.0);
                status.put("longitude", 0.0);
                status.put("speed", 0.0);
                status.put("fuelLevel", 0.0);
                status.put("engineTemp", 0.0);
            }
            fleetStatus.add(status);
        }
        return fleetStatus;
    }
}