package com.example.demo.controller;

import com.example.demo.dto.AlertDto;
import com.example.demo.dto.AlertStatsDto;
import com.example.demo.entity.AlertSeverity;
import com.example.demo.entity.AlertType;
import com.example.demo.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/alerts")
@PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER', 'MAINTENANCE_TECH', 'TECHNICIAN', 'DRIVER')")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @GetMapping
    public ResponseEntity<Page<AlertDto>> getAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) Long vehicleId,
            @RequestParam(required = false) Boolean acknowledged,
            @RequestParam(required = false) Boolean resolved,
            @RequestParam(required = false) AlertSeverity severity,
            @RequestParam(required = false) AlertType alertType,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        String effectiveFromStr = (from != null && !from.isBlank()) ? from : startDate;
        String effectiveToStr = (to != null && !to.isBlank()) ? to : endDate;

        LocalDateTime fromDate = parseDateTime(effectiveFromStr, false);
        LocalDateTime toDate = parseDateTime(effectiveToStr, true);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "occurredAt"));

        Page<AlertDto> result = alertService.getAlertsWithFilters(
                acknowledged,
                resolved,
                severity,
                alertType,
                vehicleId,
                fromDate,
                toDate,
                pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlertDto> getAlert(@PathVariable Long id) {
        Optional<AlertDto> alert = alertService.getById(id);
        return alert.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<AlertDto> acknowledgeAlert(@PathVariable Long id, Authentication auth) {
        String username = auth != null ? auth.getName() : "System";
        Optional<AlertDto> updated = alertService.acknowledge(id, username);
        return updated.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<AlertDto> resolveAlert(@PathVariable Long id, Authentication auth) {
        String username = auth != null ? auth.getName() : "System";
        Optional<AlertDto> updated = alertService.resolve(id, username);
        return updated.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/bulk-acknowledge")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER', 'MAINTENANCE_TECH', 'TECHNICIAN')")
    public ResponseEntity<Map<String, Integer>> bulkAcknowledge(
            @RequestBody Map<String, List<Long>> request,
            Authentication auth) {
        List<Long> ids = request != null ? request.get("ids") : Collections.emptyList();
        String username = auth != null ? auth.getName() : "System";
        int updated = alertService.bulkAcknowledge(ids, username);
        return ResponseEntity.ok(Map.of("updated", updated));
    }

    @PostMapping("/bulk-resolve")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER', 'MAINTENANCE_TECH', 'TECHNICIAN')")
    public ResponseEntity<Map<String, Integer>> bulkResolve(
            @RequestBody Map<String, List<Long>> request,
            Authentication auth) {
        List<Long> ids = request != null ? request.get("ids") : Collections.emptyList();
        String username = auth != null ? auth.getName() : "System";
        int updated = alertService.bulkResolve(ids, username);
        return ResponseEntity.ok(Map.of("updated", updated));
    }

    @DeleteMapping("/purge")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<Map<String, Integer>> purgeOldAlerts(
            @RequestParam(defaultValue = "30") int olderThanDays) {
        int deleted = alertService.purgeResolvedOlderThan(olderThanDays);
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }

    @GetMapping("/stats")
    public ResponseEntity<AlertStatsDto> getStats() {
        return ResponseEntity.ok(alertService.getStats());
    }

    private LocalDateTime parseDateTime(String input, boolean isEndOfDay) {
        if (input == null || input.trim().isEmpty()) {
            return null;
        }
        try {
            String trimmed = input.trim();
            if (trimmed.length() == 10) {
                LocalDate date = LocalDate.parse(trimmed);
                return isEndOfDay ? date.atTime(23, 59, 59) : date.atStartOfDay();
            }
            return LocalDateTime.parse(trimmed);
        } catch (Exception e) {
            return null;
        }
    }
}