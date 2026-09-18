package com.example.demo.controller;

import com.example.demo.entity.Trip;
import com.example.demo.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:3000")
public class TripController {

    @Autowired
    private TripService tripService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Trip>> getAllTrips() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        List<Trip> trips = tripService.getAllTripsForUser(username);
        return ResponseEntity.ok(trips);
    }

    @PostMapping("/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Trip> startTrip(@RequestBody Map<String, Long> request) {
        Long vehicleId = request.get("vehicleId");
        Long driverId = request.get("driverId");
        Trip startedTrip = tripService.startTrip(vehicleId, driverId);
        return new ResponseEntity<>(startedTrip, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/end")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Trip> endTrip(@PathVariable Long id, @RequestBody Map<String, Double> request) {
        Double distance = request.get("distance");
        Trip endedTrip = tripService.endTrip(id, distance);
        return ResponseEntity.ok(endedTrip);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<Trip> cancelTrip(@PathVariable Long id) {
        Trip cancelledTrip = tripService.cancelTrip(id);
        return ResponseEntity.ok(cancelledTrip);
    }

    @PostMapping("/schedule")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<Trip> scheduleTrip(@RequestBody Map<String, Object> request) {
        Long vehicleId = Long.valueOf(request.get("vehicleId").toString());
        Long driverId = Long.valueOf(request.get("driverId").toString());
        LocalDateTime scheduledTime = LocalDateTime.parse(request.get("scheduledTime").toString());
        Trip scheduledTrip = tripService.scheduleTrip(vehicleId, driverId, scheduledTime);
        return new ResponseEntity<>(scheduledTrip, HttpStatus.CREATED);
    }

    @GetMapping("/driver/{driverId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Trip>> getTripsByDriver(@PathVariable Long driverId) {
        List<Trip> trips = tripService.getTripsByDriver(driverId);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Trip>> getTripsByVehicle(@PathVariable Long vehicleId) {
        List<Trip> trips = tripService.getTripsByVehicle(vehicleId);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        Trip trip = tripService.getTripById(id);
        return ResponseEntity.ok(trip);
    }
}