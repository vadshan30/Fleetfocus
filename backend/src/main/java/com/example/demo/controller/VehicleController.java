package com.example.demo.controller;

import com.example.demo.entity.Vehicle;
import com.example.demo.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Vehicle Management", description = "Endpoints for managing fleet vehicles, inventory, and status")
@SecurityRequirement(name = "bearerAuth")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService,
                             @Value("${app.vehicle-controller.dummy:default}") String dummy) {
        this.vehicleService = vehicleService;
    }

    @Operation(
            summary = "Get all vehicles (Paginated)",
            description = "Retrieves a paginated list of all registered vehicles in the fleet database. Supports 0-indexed page number and page size."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved vehicles page",
                    content = @Content(schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT bearer token"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<Vehicle>> getAllVehicles(
            @Parameter(name = "page", description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(name = "size", description = "Number of items per page", example = "10")
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(vehicleService.getAllVehicles(pageable));
    }

    @Operation(
            summary = "Get available vehicles for dispatch",
            description = "Returns a list of all vehicles currently marked with status 'AVAILABLE'."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved available vehicles"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT bearer token")
    })
    @GetMapping("/available")
    @PreAuthorize("isAuthenticated()")
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

    @Operation(
            summary = "Get vehicle by ID",
            description = "Retrieves detailed information for a specific vehicle by its unique database ID."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Vehicle found",
                    content = @Content(schema = @Schema(implementation = Vehicle.class))),
            @ApiResponse(responseCode = "404", description = "Vehicle not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT bearer token")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Vehicle> getVehicleById(
            @Parameter(name = "id", description = "Vehicle Database ID", example = "1")
            @PathVariable Long id) {

        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @Operation(
            summary = "Create a new vehicle",
            description = "Adds a new vehicle to the fleet inventory. Restricted to FLEET_MANAGER role."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Vehicle created successfully"),
            @ApiResponse(responseCode = "400", description = "Validation error - Invalid VIN or license plate"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Requires FLEET_MANAGER role")
    })
    @PostMapping
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<String> createVehicle(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Vehicle details",
                    required = true,
                    content = @Content(schema = @Schema(implementation = Vehicle.class))
            )
            @RequestBody Vehicle vehicle) {

        vehicleService.createVehicle(vehicle);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Vehicle created successfully.");
    }

    @Operation(
            summary = "Update an existing vehicle",
            description = "Updates vehicle specifications, current mileage, or operational status by ID."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Vehicle updated successfully"),
            @ApiResponse(responseCode = "404", description = "Vehicle not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Requires FLEET_MANAGER role")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<String> updateVehicle(
            @Parameter(name = "id", description = "Vehicle Database ID", example = "1")
            @PathVariable Long id,
            @RequestBody Vehicle vehicle) {

        vehicleService.updateVehicle(id, vehicle);

        return ResponseEntity.ok("Vehicle updated successfully.");
    }

    @Operation(
            summary = "Delete vehicle by ID",
            description = "Removes a vehicle from the system by its ID. Restricted to FLEET_MANAGER role."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Vehicle deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Vehicle not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Requires FLEET_MANAGER role")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<String> deleteVehicle(
            @Parameter(name = "id", description = "Vehicle Database ID", example = "1")
            @PathVariable Long id) {

        vehicleService.deleteVehicle(id);

        return ResponseEntity.ok("Vehicle deleted successfully.");
    }
}