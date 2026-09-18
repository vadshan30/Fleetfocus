package com.example.demo.service;

import com.example.demo.entity.MaintenanceLog;
import com.example.demo.entity.SystemUser;
import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.MaintenanceLogRepository;
import com.example.demo.repository.SystemUserRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final VehicleRepository vehicleRepository;
    private final SystemUserRepository systemUserRepository;

    @Autowired
    public MaintenanceService(MaintenanceLogRepository maintenanceLogRepository,
                              VehicleRepository vehicleRepository,
                              SystemUserRepository systemUserRepository) {
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.vehicleRepository = vehicleRepository;
        this.systemUserRepository = systemUserRepository;
    }

    public List<MaintenanceLog> getAllLogs() {
        return maintenanceLogRepository.findAll();
    }
    @Transactional
    public MaintenanceLog logMaintenance(MaintenanceLog log) {
        Vehicle vehicle = vehicleRepository.findById(log.getVehicle().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + log.getVehicle().getId()));
        SystemUser technician = systemUserRepository.findById(log.getTechnician().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + log.getTechnician().getId()));
        vehicle.setStatus(VehicleStatus.UNDER_MAINTENANCE);
        vehicleRepository.save(vehicle);
        log.setVehicle(vehicle);
        log.setTechnician(technician);
        if (log.getServiceDate() == null) {
            log.setServiceDate(LocalDate.now());
        }
        return maintenanceLogRepository.save(log);
    }
}