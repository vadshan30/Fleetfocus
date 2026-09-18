package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripStatus status;

    @Column(name = "distance_covered")
    private Double distanceCovered = 0.0;

    public Trip() {
    }

    public Trip(Vehicle vehicle, Driver driver) {
        this.vehicle = vehicle;
        this.driver = driver;
        this.startTime = LocalDateTime.now();
        this.status = TripStatus.IN_PROGRESS;
        this.distanceCovered = 0.0;
    }

    public Trip(Long id, Vehicle vehicle) {
        this.id = id;
        this.vehicle = vehicle;
        this.driver = null;
        this.startTime = LocalDateTime.now();
        this.status = TripStatus.IN_PROGRESS;
        this.distanceCovered = 0.0;
    }

    public Trip(Vehicle vehicle, Driver driver, LocalDateTime startTime, TripStatus status) {
        this.vehicle = vehicle;
        this.driver = driver;
        this.startTime = startTime;
        this.status = status;
        this.distanceCovered = 0.0;
    }

    public Trip(Long id, Vehicle vehicle, Driver driver, LocalDateTime startTime, TripStatus status) {
        this.id = id;
        this.vehicle = vehicle;
        this.driver = driver;
        this.startTime = startTime;
        this.status = status;
        this.distanceCovered = 0.0;
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

    public Driver getDriver() {
        return driver;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public TripStatus getStatus() {
        return status;
    }

    public void setStatus(TripStatus status) {
        this.status = status;
    }

    public Double getDistanceCovered() {
        return distanceCovered;
    }

    public void setDistanceCovered(Double distanceCovered) {
        this.distanceCovered = distanceCovered;
    }
}