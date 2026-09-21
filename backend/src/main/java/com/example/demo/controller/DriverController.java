package com.example.demo.controller;

import com.example.demo.entity.Driver;
import com.example.demo.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "http://localhost:3000")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<List<Driver>> getAllDrivers() {
        List<Driver> drivers = driverService.getAllDrivers();
        System.out.println("🔵 getAllDrivers called, returning: " + drivers.size() + " drivers");
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<List<Driver>> getAvailableDrivers() {
        return ResponseEntity.ok(driverService.getAvailableDrivers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<Driver> getDriverById(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<?> createDriver(@RequestBody Driver driver) {
        try {
            System.out.println("🔵 Creating driver for user_id: " + (driver.getUser() != null ? driver.getUser().getId() : "null"));
            Driver createdDriver = driverService.createDriver(driver);
            return new ResponseEntity<>(createdDriver, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating driver: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<Driver> updateDriver(@PathVariable Long id, @RequestBody Driver driverDetails) {
        return ResponseEntity.ok(driverService.updateDriver(id, driverDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<String> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok("Driver deleted successfully.");
    }
}