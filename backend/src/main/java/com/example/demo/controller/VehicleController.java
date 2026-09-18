package com.example.demo.controller;

import com.example.demo.entity.Vehicle;
import com.example.demo.service.VehicleService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    
    public VehicleController(VehicleService vehicleService,
                              @Value("${app.vehicle-controller.dummy:default}") String dummy) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER','DISPATCHER','DRIVER','MAINTENANCE_TECH')")
    public ResponseEntity<Page<Vehicle>> getAllVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(vehicleService.getAllVehicles(pageable));
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER','DISPATCHER')")
    public ResponseEntity<List<Vehicle>> getAvailableVehicles() {

        List<Vehicle> vehicles =
                vehicleService.getAllVehicles(PageRequest.of(0, 1000))
                        .getContent()
                        .stream()
                        .filter(v -> v.getStatus() != null &&
                                v.getStatus().name().equals("AVAILABLE"))
                        .toList();

        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER','DISPATCHER')")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {

        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<String> createVehicle(@RequestBody Vehicle vehicle) {

        vehicleService.createVehicle(vehicle);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Vehicle created successfully.");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<String> updateVehicle(
            @PathVariable Long id,
            @RequestBody Vehicle vehicle) {

        vehicleService.updateVehicle(id, vehicle);

        return ResponseEntity.ok("Vehicle updated successfully.");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<String> deleteVehicle(@PathVariable Long id) {

        vehicleService.deleteVehicle(id);

        return ResponseEntity.ok("Vehicle deleted successfully.");
    }
}