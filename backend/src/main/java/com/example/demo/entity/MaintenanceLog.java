package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance_logs")
public class MaintenanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "technician_id", nullable = false)
    private SystemUser technician;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double cost;

    public MaintenanceLog() {
    }

    public MaintenanceLog(Vehicle vehicle, SystemUser technician) {
        this.vehicle = vehicle;
        this.technician = technician;
        this.serviceDate = LocalDate.now();
        this.description = "Maintenance work";
        this.cost = 0.0;
    }

    public MaintenanceLog(Long id, Vehicle vehicle) {
        this.id = id;
        this.vehicle = vehicle;
        this.technician = null;
        this.serviceDate = LocalDate.now();
        this.description = "Maintenance work";
        this.cost = 0.0;
    }

    public MaintenanceLog(Vehicle vehicle, SystemUser technician, LocalDate serviceDate, String description, Double cost) {
        this.vehicle = vehicle;
        this.technician = technician;
        this.serviceDate = serviceDate;
        this.description = description;
        this.cost = cost;
    }

    public MaintenanceLog(Long id, Vehicle vehicle, SystemUser technician, LocalDate serviceDate, String description, Double cost) {
        this.id = id;
        this.vehicle = vehicle;
        this.technician = technician;
        this.serviceDate = serviceDate;
        this.description = description;
        this.cost = cost;
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

    public SystemUser getTechnician() {
        return technician;
    }

    public void setTechnician(SystemUser technician) {
        this.technician = technician;
    }

    public LocalDate getServiceDate() {
        return serviceDate;
    }

    public void setServiceDate(LocalDate serviceDate) {
        this.serviceDate = serviceDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }
}