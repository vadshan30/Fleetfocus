package com.example.demo.service;

import com.example.demo.dto.AlertDto;
import com.example.demo.dto.AlertStatsDto;
import com.example.demo.entity.AlertHistory;
import com.example.demo.entity.AlertSeverity;
import com.example.demo.entity.AlertType;
import com.example.demo.entity.Vehicle;
import com.example.demo.repository.AlertHistoryRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AlertService {

    @Autowired
    private AlertHistoryRepository alertRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Transactional(readOnly = true)
    public Page<AlertDto> getAlertsWithFilters(
            Boolean acknowledged,
            Boolean resolved,
            AlertSeverity severity,
            AlertType alertType,
            Long vehicleId,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable) {

        Page<AlertHistory> page = alertRepository.findWithFilters(
                acknowledged, resolved, severity, alertType, vehicleId, from, to, pageable);

        if (page.isEmpty()) {
            return Page.empty(pageable);
        }

        Set<Long> vehicleIds = page.getContent().stream()
                .map(AlertHistory::getVehicleId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> vehiclePlateMap = new HashMap<>();
        if (!vehicleIds.isEmpty()) {
            List<Vehicle> vehicles = vehicleRepository.findAllById(vehicleIds);
            for (Vehicle v : vehicles) {
                vehiclePlateMap.put(v.getId(), v.getLicensePlate());
            }
        }

        List<AlertDto> dtos = page.getContent().stream()
                .map(alert -> toDto(alert, vehiclePlateMap.get(alert.getVehicleId())))
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Optional<AlertDto> getById(Long id) {
        return alertRepository.findById(id).map(alert -> {
            String plate = null;
            if (alert.getVehicleId() != null) {
                plate = vehicleRepository.findById(alert.getVehicleId())
                        .map(Vehicle::getLicensePlate)
                        .orElse(null);
            }
            return toDto(alert, plate);
        });
    }

    @Transactional
    public int bulkAcknowledge(List<Long> ids, String username) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        return alertRepository.bulkAcknowledge(ids, LocalDateTime.now(), username);
    }

    @Transactional
    public int bulkResolve(List<Long> ids, String username) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        return alertRepository.bulkResolve(ids, LocalDateTime.now(), username);
    }

    @Transactional
    public Optional<AlertDto> acknowledge(Long id, String username) {
        Optional<AlertHistory> opt = alertRepository.findById(id);
        if (opt.isEmpty()) {
            return Optional.empty();
        }
        AlertHistory alert = opt.get();
        alert.setAcknowledged(true);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setAcknowledgedBy(username);
        alertRepository.save(alert);

        String plate = alert.getVehicleId() != null
                ? vehicleRepository.findById(alert.getVehicleId()).map(Vehicle::getLicensePlate).orElse(null)
                : null;
        return Optional.of(toDto(alert, plate));
    }

    @Transactional
    public Optional<AlertDto> resolve(Long id, String username) {
        Optional<AlertHistory> opt = alertRepository.findById(id);
        if (opt.isEmpty()) {
            return Optional.empty();
        }
        AlertHistory alert = opt.get();
        alert.setResolved(true);
        if (!Boolean.TRUE.equals(alert.getAcknowledged())) {
            alert.setAcknowledged(true);
            alert.setAcknowledgedAt(LocalDateTime.now());
            alert.setAcknowledgedBy(username);
        }
        alertRepository.save(alert);

        String plate = alert.getVehicleId() != null
                ? vehicleRepository.findById(alert.getVehicleId()).map(Vehicle::getLicensePlate).orElse(null)
                : null;
        return Optional.of(toDto(alert, plate));
    }

    @Transactional
    public int purgeResolvedOlderThan(int days) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        return alertRepository.deleteResolvedBefore(cutoff);
    }

    @Transactional(readOnly = true)
    public AlertStatsDto getStats() {
        long total = alertRepository.count();
        long critical = alertRepository.countBySeverity(AlertSeverity.CRITICAL);
        long warning = alertRepository.countBySeverity(AlertSeverity.WARNING);
        long info = alertRepository.countBySeverity(AlertSeverity.INFO);
        long unacknowledged = alertRepository.countByAcknowledgedFalse();
        long resolved = alertRepository.countByResolvedTrue();

        LocalDateTime oldestUnacked = alertRepository
                .findFirstByAcknowledgedFalseOrderByOccurredAtAsc()
                .map(AlertHistory::getOccurredAt)
                .orElse(null);

        long last24h = alertRepository.countByOccurredAtAfter(LocalDateTime.now().minusHours(24));

        return new AlertStatsDto(
                total,
                critical,
                warning,
                info,
                unacknowledged,
                resolved,
                oldestUnacked,
                last24h
        );
    }

    private AlertDto toDto(AlertHistory alert, String licensePlate) {
        AlertDto dto = new AlertDto();
        dto.setId(alert.getId());
        dto.setAlertType(alert.getAlertType());
        dto.setSeverity(alert.getSeverity());
        dto.setMessage(alert.getMessage());
        dto.setVehicleId(alert.getVehicleId());
        dto.setLicensePlate(licensePlate != null ? licensePlate : (alert.getVehicleId() != null ? "Vehicle #" + alert.getVehicleId() : "N/A"));
        dto.setGeofenceId(alert.getGeofenceId());
        dto.setGeofenceName(alert.getGeofenceName());
        dto.setRuleId(alert.getRuleId());
        dto.setRuleName(alert.getRuleName());
        dto.setActualValue(alert.getActualValue());
        dto.setThresholdValue(alert.getThresholdValue());
        dto.setMetric(alert.getMetric());
        dto.setOccurredAt(alert.getOccurredAt());
        dto.setAcknowledged(alert.getAcknowledged());
        dto.setAcknowledgedAt(alert.getAcknowledgedAt());
        dto.setAcknowledgedBy(alert.getAcknowledgedBy());
        dto.setResolved(alert.getResolved());
        return dto;
    }
}
