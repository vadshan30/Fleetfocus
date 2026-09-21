package com.example.demo.controller;

import com.example.demo.entity.MaintenanceLog;
import com.example.demo.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER', 'MAINTENANCE_TECH', 'TECHNICIAN')")
    public ResponseEntity<List<MaintenanceLog>> getAllMaintenanceLogs() {
        return ResponseEntity.ok(maintenanceService.getAllLogs());
    }

    @PostMapping("/log")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'MAINTENANCE_TECH', 'TECHNICIAN')")
    public ResponseEntity<MaintenanceLog> logMaintenance(@RequestBody MaintenanceLog maintenanceLog) {
        MaintenanceLog savedLog = maintenanceService.logMaintenance(maintenanceLog);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLog);
    }
}