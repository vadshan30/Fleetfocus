package com.example.demo.service;

import com.example.demo.entity.AlertHistory;
import com.example.demo.entity.AlertMetric;
import com.example.demo.entity.AlertRule;
import com.example.demo.entity.AlertType;
import com.example.demo.entity.TelemetryData;
import com.example.demo.repository.AlertHistoryRepository;
import com.example.demo.repository.AlertRuleRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class AlertRuleService {

    private final AlertRuleRepository alertRuleRepository;
    private final AlertHistoryRepository alertHistoryRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, LocalDateTime> lastAlertTime = new ConcurrentHashMap<>();
    private static final int DEBOUNCE_SECONDS = 60;

    public AlertRuleService(AlertRuleRepository alertRuleRepository,
                            AlertHistoryRepository alertHistoryRepository,
                            SimpMessagingTemplate messagingTemplate) {
        this.alertRuleRepository = alertRuleRepository;
        this.alertHistoryRepository = alertHistoryRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<AlertRule> getAllRules() {
        return alertRuleRepository.findAll();
    }

    public List<AlertRule> getActiveRules() {
        return alertRuleRepository.findByActiveTrue();
    }

    public AlertRule getRuleById(Long id) {
        return alertRuleRepository.findById(id).orElse(null);
    }

    public AlertRule createRule(AlertRule rule) {
        rule.setCreatedAt(LocalDateTime.now());
        rule.setUpdatedAt(LocalDateTime.now());
        return alertRuleRepository.save(rule);
    }

    public AlertRule updateRule(Long id, AlertRule updated) {
        AlertRule existing = alertRuleRepository.findById(id).orElse(null);
        if (existing == null) return null;
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setMetric(updated.getMetric());
        existing.setOperator(updated.getOperator());
        existing.setThresholdValue(updated.getThresholdValue());
        existing.setSeverity(updated.getSeverity());
        existing.setActive(updated.getActive());
        existing.setVehicleId(updated.getVehicleId());
        existing.setQuietHoursStart(updated.getQuietHoursStart());
        existing.setQuietHoursEnd(updated.getQuietHoursEnd());
        existing.setUpdatedAt(LocalDateTime.now());
        return alertRuleRepository.save(existing);
    }

    public void deactivateRule(Long id) {
        AlertRule existing = alertRuleRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setActive(false);
            existing.setUpdatedAt(LocalDateTime.now());
            alertRuleRepository.save(existing);
        }
    }

    public List<AlertRule> getEffectiveRulesFor(Long vehicleId) {
        List<AlertRule> vehicleRules = alertRuleRepository.findByVehicleIdAndActiveTrue(vehicleId);
        if (!vehicleRules.isEmpty()) {
            return vehicleRules;
        }
        return alertRuleRepository.findByVehicleIdIsNullAndActiveTrue();
    }

    public Optional<AlertRule> evaluate(TelemetryData telemetry) {
        if (telemetry == null) {
            return Optional.empty();
        }

        Long vehicleId = telemetry.getVehicle() != null ? telemetry.getVehicle().getId() : null;
        if (vehicleId == null) {
            return Optional.empty();
        }

        List<AlertRule> effectiveRules = getEffectiveRulesFor(vehicleId);
        if (effectiveRules.isEmpty()) {
            return Optional.empty();
        }

        for (AlertRule rule : effectiveRules) {
            if (!rule.getActive()) continue;
            if (rule.isInQuietHours()) continue;

            Double actualValue = getMetricValue(telemetry, rule.getMetric());
            if (actualValue == null) continue;

            boolean matches = evaluateRule(rule, actualValue);
            if (!matches) continue;

            String debounceKey = vehicleId + ":" + rule.getId();
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime lastTime = lastAlertTime.get(debounceKey);

            if (lastTime != null && lastTime.plusSeconds(DEBOUNCE_SECONDS).isAfter(now)) {
                continue;
            }

            lastAlertTime.put(debounceKey, now);
            return Optional.of(rule);
        }

        return Optional.empty();
    }

    private Double getMetricValue(TelemetryData telemetry, AlertMetric metric) {
        return switch (metric) {
            case SPEED -> telemetry.getSpeed();
            case FUEL_LEVEL -> telemetry.getFuelLevel();
            case ENGINE_TEMP -> telemetry.getEngineTemp();
            case IDLE_DURATION -> null; // Not available in current TelemetryData
            case HARSH_BRAKING -> null; // Not available in current TelemetryData
        };
    }

    private boolean evaluateRule(AlertRule rule, Double actualValue) {
        Double threshold = rule.getThresholdValue();
        return switch (rule.getOperator()) {
            case GREATER_THAN -> actualValue > threshold;
            case LESS_THAN -> actualValue < threshold;
            case EQUALS -> Math.abs(actualValue - threshold) < 0.001;
        };
    }

    public void broadcastAlert(TelemetryData telemetry, AlertRule rule, String message) {
        Long vehicleId = telemetry.getVehicle().getId();
        String licensePlate = telemetry.getVehicle().getLicensePlate();
        Double actualValue = getMetricValue(telemetry, rule.getMetric());

        AlertHistory history = new AlertHistory(rule.getId(), vehicleId, AlertType.RULE_BREACH,
                rule.getSeverity(), message);
        history.setActualValue(actualValue);
        history.setThresholdValue(rule.getThresholdValue());
        history.setMetric(rule.getMetric().name());
        history.setRuleName(rule.getName());
        alertHistoryRepository.save(history);

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "RULE_BREACH");
        payload.put("ruleId", rule.getId().toString());
        payload.put("ruleName", rule.getName());
        payload.put("metric", rule.getMetric().name());
        payload.put("thresholdValue", rule.getThresholdValue());
        payload.put("actualValue", actualValue);
        payload.put("severity", rule.getSeverity().name().toLowerCase());
        payload.put("vehicleId", vehicleId.toString());
        payload.put("licensePlate", licensePlate);
        payload.put("message", message);
        payload.put("timestamp", LocalDateTime.now().toString());

        messagingTemplate.convertAndSend("/topic/alerts", payload);
    }

    public String buildMessage(TelemetryData telemetry, AlertRule rule) {
        Double actualValue = getMetricValue(telemetry, rule.getMetric());
        String metricDisplay = switch (rule.getMetric()) {
            case SPEED -> "Speed";
            case FUEL_LEVEL -> "Fuel Level";
            case ENGINE_TEMP -> "Engine Temperature";
            case IDLE_DURATION -> "Idle Duration";
            case HARSH_BRAKING -> "Harsh Braking";
        };
        String operatorDisplay = switch (rule.getOperator()) {
            case GREATER_THAN -> "exceeded";
            case LESS_THAN -> "dropped below";
            case EQUALS -> "equals";
        };
        String unit = switch (rule.getMetric()) {
            case SPEED -> "km/h";
            case FUEL_LEVEL -> "%";
            case ENGINE_TEMP -> "°C";
            case IDLE_DURATION -> "min";
            case HARSH_BRAKING -> "events";
        };
        return String.format("Vehicle %s: %s %s threshold (%s %s, current: %s %s)",
                telemetry.getVehicle().getLicensePlate(),
                metricDisplay,
                operatorDisplay,
                rule.getThresholdValue(),
                unit,
                actualValue,
                unit);
    }
}