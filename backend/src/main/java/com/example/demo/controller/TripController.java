package com.example.demo.controller;

import com.example.demo.dto.MaintenanceIssueDto;
import com.example.demo.dto.TripEtaDto;
import com.example.demo.entity.MaintenanceLog;
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
            description = "Retrieves all trips across the entire fleet. Restricted to Managers and Dispatchers."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved trips list"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT bearer token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Requires FLEET_MANAGER or DISPATCHER role")
    })
    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<List<Trip>> getAllTrips() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        List<Trip> trips = tripService.getAllTripsForUser(username);
        return ResponseEntity.ok(trips);
    }

    @Operation(
            summary = "Get trips assigned to current driver",
            description = "Retrieves all trips assigned to the currently authenticated driver user."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved driver's assigned trips"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT bearer token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Requires DRIVER role")
    })
    @GetMapping("/mine")
    @PreAuthorize("hasRole('DRIVER')")
    public List<Trip> getMyTrips(Authentication auth) {
        String username = auth != null ? auth.getName() : SecurityContextHolder.getContext().getAuthentication().getName();
        return tripService.getTripsByDriverUsername(username);
    }

    @Operation(
            summary = "Start / Dispatch a new trip",
            description = "Immediately dispatches an available vehicle with an available driver for a trip."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Trip dispatched successfully",
                    content = @Content(schema = @Schema(implementation = Trip.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request - Vehicle or driver not available"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT bearer token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Requires FLEET_MANAGER or DISPATCHER role")
    })
    @PostMapping("/start")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
    public ResponseEntity<Trip> startTrip(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "JSON payload containing vehicleId, driverId, and optional origin/destination coordinates",
                    required = true
            )
            @RequestBody Map<String, Object> request) {
        Long vehicleId = Long.valueOf(request.get("vehicleId").toString());
        Long driverId = Long.valueOf(request.get("driverId").toString());
        Double originLat = request.get("originLat") != null ? Double.valueOf(request.get("originLat").toString()) : null;
        Double originLng = request.get("originLng") != null ? Double.valueOf(request.get("originLng").toString()) : null;
        Double destinationLat = request.get("destinationLat") != null ? Double.valueOf(request.get("destinationLat").toString()) : null;
        Double destinationLng = request.get("destinationLng") != null ? Double.valueOf(request.get("destinationLng").toString()) : null;
        LocalDateTime scheduledEndTime = request.get("scheduledEndTime") != null ? LocalDateTime.parse(request.get("scheduledEndTime").toString()) : null;

        Trip startedTrip = tripService.startTrip(vehicleId, driverId, originLat, originLng, destinationLat, destinationLng, scheduledEndTime);
        return new ResponseEntity<>(startedTrip, HttpStatus.CREATED);
    }

    @Operation(
            summary = "End an active trip",
            description = "Marks an active trip as COMPLETED, logs total distance covered in km, and frees vehicle and driver status to AVAILABLE."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Trip completed successfully"),
            @ApiResponse(responseCode = "400", description = "Bad Request - Cannot end a completed or cancelled trip"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Requires FLEET_MANAGER or DISPATCHER role"),
            @ApiResponse(responseCode = "404", description = "Trip not found")
    })
    @PutMapping("/{id}/end")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
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
                    description = "JSON payload containing vehicleId, driverId, scheduledTime (ISO format), and optional coordinates",
                    required = true
            )
            @RequestBody Map<String, Object> request) {
        Long vehicleId = Long.valueOf(request.get("vehicleId").toString());
        Long driverId = Long.valueOf(request.get("driverId").toString());
        LocalDateTime scheduledTime = LocalDateTime.parse(request.get("scheduledTime").toString());
        Double originLat = request.get("originLat") != null ? Double.valueOf(request.get("originLat").toString()) : null;
        Double originLng = request.get("originLng") != null ? Double.valueOf(request.get("originLng").toString()) : null;
        Double destinationLat = request.get("destinationLat") != null ? Double.valueOf(request.get("destinationLat").toString()) : null;
        Double destinationLng = request.get("destinationLng") != null ? Double.valueOf(request.get("destinationLng").toString()) : null;
        LocalDateTime scheduledEndTime = request.get("scheduledEndTime") != null ? LocalDateTime.parse(request.get("scheduledEndTime").toString()) : null;

        Trip scheduledTrip = tripService.scheduleTrip(vehicleId, driverId, scheduledTime, originLat, originLng, destinationLat, destinationLng, scheduledEndTime);
        return new ResponseEntity<>(scheduledTrip, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Get trips by driver ID",
            description = "Retrieves all trips assigned to a specific driver by driver ID."
    )
    @GetMapping("/driver/{driverId}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
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
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
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

    @Operation(
            summary = "Get Trip live ETA and delay status",
            description = "Calculates or retrieves live ETA, delay minutes, and remaining distance in kilometers."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved trip ETA details"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT bearer token"),
            @ApiResponse(responseCode = "404", description = "Trip not found")
    })
    @GetMapping("/{id}/eta")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TripEtaDto> getTripEta(
            @Parameter(name = "id", description = "Trip Database ID", example = "1")
            @PathVariable Long id) {
        TripEtaDto etaDto = tripService.getTripEta(id);
        return ResponseEntity.ok(etaDto);
    }

    @Operation(
            summary = "Start trip by driver",
            description = "Allows an assigned driver to transition a SCHEDULED trip to IN_PROGRESS."
    )
    @PostMapping("/{id}/start-by-driver")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Trip> startTripByDriver(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Trip trip = tripService.startTripByDriver(id, auth.getName());
        return ResponseEntity.ok(trip);
    }

    @Operation(
            summary = "End trip by driver",
            description = "Allows an assigned driver to complete their active trip and free the vehicle."
    )
    @PostMapping("/{id}/end-by-driver")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Trip> endTripByDriver(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Double distanceKm = null;
        if (body != null && body.containsKey("distanceKm") && body.get("distanceKm") != null) {
            try {
                distanceKm = Double.valueOf(body.get("distanceKm").toString());
            } catch (NumberFormatException ignored) {
            }
        }
        Trip trip = tripService.endTripByDriver(id, distanceKm, auth.getName());
        return ResponseEntity.ok(trip);
    }

    @Operation(
            summary = "Report maintenance issue from driver",
            description = "Allows an assigned driver to report an issue for the vehicle on their trip."
    )
    @PostMapping("/{id}/report-issue")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<MaintenanceLog> reportIssueFromDriver(
            @PathVariable Long id,
            @RequestBody MaintenanceIssueDto dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        MaintenanceLog log = tripService.reportIssueFromDriver(id, dto, auth.getName());
        return ResponseEntity.ok(log);
    }
}