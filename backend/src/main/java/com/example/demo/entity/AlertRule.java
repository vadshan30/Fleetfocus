package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alert_rules")
public class AlertRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric", nullable = false)
    private AlertMetric metric;

    @Enumerated(EnumType.STRING)
    @Column(name = "operator", nullable = false)
    private AlertOperator operator;

    @Column(name = "threshold_value", nullable = false)
    private Double thresholdValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private AlertSeverity severity;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "vehicle_id")
    private Long vehicleId;

    @Column(name = "is_override", nullable = false)
    private Boolean isOverride = false;

    @Column(name = "quiet_hours_start", length = 5)
    private String quietHoursStart;

    @Column(name = "quiet_hours_end", length = 5)
    private String quietHoursEnd;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AlertRule() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public AlertRule(String name, AlertMetric metric, AlertOperator operator,
                     Double thresholdValue, AlertSeverity severity) {
        this();
        this.name = name;
        this.metric = metric;
        this.operator = operator;
        this.thresholdValue = thresholdValue;
        this.severity = severity;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public AlertMetric getMetric() {
        return metric;
    }

    public void setMetric(AlertMetric metric) {
        this.metric = metric;
    }

    public AlertOperator getOperator() {
        return operator;
    }

    public void setOperator(AlertOperator operator) {
        this.operator = operator;
    }

    public Double getThresholdValue() {
        return thresholdValue;
    }

    public void setThresholdValue(Double thresholdValue) {
        this.thresholdValue = thresholdValue;
    }

    public AlertSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(AlertSeverity severity) {
        this.severity = severity;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
        this.isOverride = vehicleId != null;
    }

    public Boolean getIsOverride() {
        return isOverride;
    }

    public void setIsOverride(Boolean isOverride) {
        this.isOverride = isOverride;
    }

    public String getQuietHoursStart() {
        return quietHoursStart;
    }

    public void setQuietHoursStart(String quietHoursStart) {
        this.quietHoursStart = quietHoursStart;
    }

    public String getQuietHoursEnd() {
        return quietHoursEnd;
    }

    public void setQuietHoursEnd(String quietHoursEnd) {
        this.quietHoursEnd = quietHoursEnd;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isInQuietHours() {
        if (quietHoursStart == null || quietHoursEnd == null) {
            return false;
        }
        try {
            String[] startParts = quietHoursStart.split(":");
            String[] endParts = quietHoursEnd.split(":");
            int startHour = Integer.parseInt(startParts[0]);
            int startMin = Integer.parseInt(startParts[1]);
            int endHour = Integer.parseInt(endParts[0]);
            int endMin = Integer.parseInt(endParts[1]);

            int nowMinutes = LocalDateTime.now().getHour() * 60 + LocalDateTime.now().getMinute();
            int startMinutes = startHour * 60 + startMin;
            int endMinutes = endHour * 60 + endMin;

            if (startMinutes <= endMinutes) {
                return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
            } else {
                // Crosses midnight (e.g., 22:00 - 06:00)
                return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
            }
        } catch (Exception e) {
            return false;
        }
    }
}