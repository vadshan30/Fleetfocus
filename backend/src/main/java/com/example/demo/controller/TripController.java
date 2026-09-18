package com.example.demo.controller;

import com.example.demo.entity.Trip;
import com.example.demo.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Trip Management", description = "Endpoints for starting, scheduling, ending, and cancelling fleet journeys")
@SecurityRequirement(name = "bearerAuth")
public class TripController {

    @Autowired
    private TripService tripService;

    @Operation(
            summary = "Get all trips",
            description = "Retrieves all trips. Managers and Dispatchers view all fleet trips, while Drivers view only their own assigned trips."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved trips list"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT bearer token")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Trip>> getAllTrips() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        List<Trip> trips = tripService.getAllTripsForUser(username);
        return ResponseEntity.ok(trips);
    }

    @Operation(
            summary = "Start / Dispatch a new trip",
            description = "Immediately dispatches an available vehicle with an available driver for a trip."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Trip dispatched successfully",
                    content = @Content(schema = @Schema(implementation = Trip.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request - Vehicle or driver not available"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT bearer token")
    })
    @PostMapping("/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Trip> startTrip(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "JSON payload containing vehicleId and driverId",
                    required = true
            )
            @RequestBody Map<String, Long> request) {
        Long vehicleId = request.get("vehicleId");
        Long driverId = request.get("driverId");
        Trip startedTrip = tripService.startTrip(vehicleId, driverId);
        return new ResponseEntity<>(startedTrip, HttpStatus.CREATED);
    }

    @Operation(
            summary = "End an active trip",
            description = "Marks an active trip as COMPLETED, logs total distance covered in km, and frees vehicle and driver status to AVAILABLE."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Trip completed successfully"),
            @ApiResponse(responseCode = "400", description = "Bad Request - Cannot end a completed or cancelled trip"),
            @ApiResponse(responseCode = "404", description = "Trip not found")
    })
    @PutMapping("/{id}/end")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Trip> endTrip(
            @Parameter(name = "id", description = "Trip Database ID", example = "1")
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "JSON payload containing distance (km) covered",
                    required = true
            )
            @RequestBody Map<String, Double> request) {
        Double distance = request.get("distance");
        Trip endedTrip = tripService.endTrip(id, distance);
        return ResponseEntity.ok(endedTrip);
    }

    @Operation(
            summary = "Cancel a trip",
            description = "Cancels a scheduled or active trip, restoring vehicle and driver statuses to AVAILABLE."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Trip cancelled successfully"),
            @ApiResponse(responseCode = "400", description = "Bad Request - Cannot cancel an already completed trip"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Requires FLEET_MANAGER or DISPATCHER role")
    })
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<Trip> cancelTrip(
            @Parameter(name = "id", description = "Trip Database ID", example = "1")
            @PathVariable Long id) {
        Trip cancelledTrip = tripService.cancelTrip(id);
        return ResponseEntity.ok(cancelledTrip);
    }

    @Operation(
            summary = "Schedule a future trip",
            description = "Schedules a trip for a future date and time."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Trip scheduled successfully"),
            @ApiResponse(responseCode = "400", description = "Bad Request - Invalid date or resources unavailable"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Requires FLEET_MANAGER or DISPATCHER role")
    })
    @PostMapping("/schedule")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<Trip> scheduleTrip(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "JSON payload containing vehicleId, driverId, and scheduledTime (ISO format)",
                    required = true
            )
            @RequestBody Map<String, Object> request) {
        Long vehicleId = Long.valueOf(request.get("vehicleId").toString());
        Long driverId = Long.valueOf(request.get("driverId").toString());
        LocalDateTime scheduledTime = LocalDateTime.parse(request.get("scheduledTime").toString());
        Trip scheduledTrip = tripService.scheduleTrip(vehicleId, driverId, scheduledTime);
        return new ResponseEntity<>(scheduledTrip, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Get trips by driver ID",
            description = "Retrieves all trips assigned to a specific driver by driver ID."
    )
    @GetMapping("/driver/{driverId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Trip>> getTripsByDriver(
            @Parameter(name = "driverId", description = "Driver Database ID", example = "1")
            @PathVariable Long driverId) {
        List<Trip> trips = tripService.getTripsByDriver(driverId);
        return ResponseEntity.ok(trips);
    }

    @Operation(
            summary = "Get trips by vehicle ID",
            description = "Retrieves all trip history associated with a specific vehicle by vehicle ID."
    )
    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Trip>> getTripsByVehicle(
            @Parameter(name = "vehicleId", description = "Vehicle Database ID", example = "1")
            @PathVariable Long vehicleId) {
        List<Trip> trips = tripService.getTripsByVehicle(vehicleId);
        return ResponseEntity.ok(trips);
    }

    @Operation(
            summary = "Get trip by ID",
            description = "Retrieves detailed information for a single trip by its trip ID."
    )
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Trip> getTripById(
            @Parameter(name = "id", description = "Trip Database ID", example = "1")
            @PathVariable Long id) {
        Trip trip = tripService.getTripById(id);
        return ResponseEntity.ok(trip);
    }
}