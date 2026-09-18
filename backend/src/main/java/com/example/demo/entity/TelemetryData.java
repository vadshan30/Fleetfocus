package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "telemetry_data")
public class TelemetryData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private Double speed;

    @Column(name = "fuel_level", nullable = false)
    private Double fuelLevel;

    @Column(name = "engine_temp", nullable = false)
    private Double engineTemp;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    public TelemetryData() {
    }

    public TelemetryData(Vehicle vehicle) {
        this.vehicle = vehicle;
        this.latitude = 0.0;
        this.longitude = 0.0;
        this.speed = 0.0;
        this.fuelLevel = 100.0;
        this.engineTemp = 80.0;
        this.recordedAt = LocalDateTime.now();
    }

    public TelemetryData(Long id, Vehicle vehicle) {
        this.id = id;
        this.vehicle = vehicle;
        this.latitude = 0.0;
        this.longitude = 0.0;
        this.speed = 0.0;
        this.fuelLevel = 100.0;
        this.engineTemp = 80.0;
        this.recordedAt = LocalDateTime.now();
    }

    public TelemetryData(Vehicle vehicle, Double latitude, Double longitude, 
                         Double speed, Double fuelLevel, Double engineTemp, 
                         LocalDateTime recordedAt) {
        this.vehicle = vehicle;
        this.latitude = latitude;
        this.longitude = longitude;
        this.speed = speed;
        this.fuelLevel = fuelLevel;
        this.engineTemp = engineTemp;
        this.recordedAt = recordedAt;
    }

    public TelemetryData(Long id, Vehicle vehicle, Double latitude, Double longitude, 
                         Double speed, Double fuelLevel, Double engineTemp, 
                         LocalDateTime recordedAt) {
        this.id = id;
        this.vehicle = vehicle;
        this.latitude = latitude;
        this.longitude = longitude;
        this.speed = speed;
        this.fuelLevel = fuelLevel;
        this.engineTemp = engineTemp;
        this.recordedAt = recordedAt;
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

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getSpeed() {
        return speed;
    }

    public void setSpeed(Double speed) {
        this.speed = speed;
    }

    public Double getFuelLevel() {
        return fuelLevel;
    }

    public void setFuelLevel(Double fuelLevel) {
        this.fuelLevel = fuelLevel;
    }

    public Double getEngineTemp() {
        return engineTemp;
    }

    public void setEngineTemp(Double engineTemp) {
        this.engineTemp = engineTemp;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}