package com.example.demo.dto;

import java.time.LocalDateTime;

public class TelemetrySnapshotDto {

    private Long vehicleId;
    private String licensePlate;
    private String model;
    private String status;
    private Double lat;
    private Double lng;
    private Double speed;
    private Double fuelLevel;
    private Double engineTemp;
    private LocalDateTime recordedAt;

    public TelemetrySnapshotDto() {
    }

    public TelemetrySnapshotDto(Long vehicleId, String licensePlate, String model, String status,
                                Double lat, Double lng, Double speed, Double fuelLevel,
                                Double engineTemp, LocalDateTime recordedAt) {
        this.vehicleId = vehicleId;
        this.licensePlate = licensePlate;
        this.model = model;
        this.status = status;
        this.lat = lat;
        this.lng = lng;
        this.speed = speed;
        this.fuelLevel = fuelLevel;
        this.engineTemp = engineTemp;
        this.recordedAt = recordedAt;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getLat() {
        return lat;
    }

    public void setLat(Double lat) {
        this.lat = lat;
    }

    public Double getLng() {
        return lng;
    }

    public void setLng(Double lng) {
        this.lng = lng;
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
