package com.example.demo.controller;

import com.example.demo.entity.AlertSeverity;
import com.example.demo.entity.GeofenceAlert;
import com.example.demo.repository.GeofenceAlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/alerts")
@PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
public class AlertController {

    @Autowired
    private GeofenceAlertRepository alertRepository;

    @GetMapping
    public ResponseEntity<Page<GeofenceAlert>> getAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean acknowledged,
            @RequestParam(required = false) AlertSeverity severity,
            @RequestParam(required = false) Boolean resolved,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "occurredAt"));

        if (acknowledged != null) {
            return ResponseEntity.ok(alertRepository.findByAcknowledgedOrderByOccurredAtDesc(acknowledged, pageable));
        }

        if (severity != null) {
            return ResponseEntity.ok(alertRepository.findBySeverityOrderByOccurredAtDesc(severity, pageable));
        }

        if (resolved != null) {
            return ResponseEntity.ok(alertRepository.findByResolvedOrderByOccurredAtDesc(resolved, pageable));
        }

        return ResponseEntity.ok(alertRepository.findAllByOrderByOccurredAtDesc(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GeofenceAlert> getAlert(@PathVariable Long id) {
        Optional<GeofenceAlert> alert = alertRepository.findById(id);
        return alert.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<GeofenceAlert> acknowledgeAlert(@PathVariable Long id, Authentication auth) {
        Optional<GeofenceAlert> optionalAlert = alertRepository.findById(id);
        if (optionalAlert.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        GeofenceAlert alert = optionalAlert.get();
        alert.setAcknowledged(true);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setAcknowledgedBy(auth.getName());

        return ResponseEntity.ok(alertRepository.save(alert));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<GeofenceAlert> resolveAlert(@PathVariable Long id) {
        Optional<GeofenceAlert> optionalAlert = alertRepository.findById(id);
        if (optionalAlert.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        GeofenceAlert alert = optionalAlert.get();
        alert.setResolved(true);

        return ResponseEntity.ok(alertRepository.save(alert));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("unacknowledged", alertRepository.countByAcknowledgedFalse());
        stats.put("critical", alertRepository.countBySeverityAndAcknowledgedFalse(AlertSeverity.CRITICAL));
        stats.put("warning", alertRepository.countBySeverityAndAcknowledgedFalse(AlertSeverity.WARNING));
        stats.put("info", alertRepository.countBySeverityAndAcknowledgedFalse(AlertSeverity.INFO));
        return ResponseEntity.ok(stats);
    }
}