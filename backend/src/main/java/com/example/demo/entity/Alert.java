package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String severity;

    @Column(nullable = false)
    private String message;

    @Column(name = "is_resolved")
    private Boolean isResolved = false;

    public Alert() {
    }

    public Alert(Vehicle vehicle, String type) {
        this.vehicle = vehicle;
        this.type = type;
        this.severity = "LOW";
        this.message = "Alert: " + type;
        this.isResolved = false;
    }

    public Alert(Long id, Vehicle vehicle) {
        this.id = id;
        this.vehicle = vehicle;
        this.type = "DEFAULT";
        this.severity = "LOW";
        this.message = "Default Alert";
        this.isResolved = false;
    }

    public Alert(Vehicle vehicle, String type, String severity, String message) {
        this.vehicle = vehicle;
        this.type = type;
        this.severity = severity;
        this.message = message;
        this.isResolved = false;
    }

    public Alert(Long id, Vehicle vehicle, String type, String severity, String message) {
        this.id = id;
        this.vehicle = vehicle;
        this.type = type;
        this.severity = severity;
        this.message = message;
        this.isResolved = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getIsResolved() {
        return isResolved;
    }

    public void setIsResolved(Boolean isResolved) {
        this.isResolved = isResolved;
    }
}