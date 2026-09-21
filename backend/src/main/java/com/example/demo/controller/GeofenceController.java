package com.example.demo.controller;

import com.example.demo.entity.Geofence;
import com.example.demo.service.GeofenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/geofences")
public class GeofenceController {

    @Autowired
    private GeofenceService geofenceService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Geofence>> getAllGeofences() {
        return ResponseEntity.ok(geofenceService.getAllGeofences());
    }

    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Geofence>> getActiveGeofences() {
        return ResponseEntity.ok(geofenceService.getActiveGeofences());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Geofence> getGeofence(@PathVariable Long id) {
        Geofence geofence = geofenceService.getGeofenceById(id);
        if (geofence == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(geofence);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<Geofence> createGeofence(@RequestBody Geofence geofence) {
        Geofence created = geofenceService.createGeofence(geofence);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<Geofence> updateGeofence(@PathVariable Long id, @RequestBody Geofence geofence) {
        Geofence updated = geofenceService.updateGeofence(id, geofence);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<Void> deleteGeofence(@PathVariable Long id) {
        geofenceService.deactivateGeofence(id);
        return ResponseEntity.ok().build();
    }
}