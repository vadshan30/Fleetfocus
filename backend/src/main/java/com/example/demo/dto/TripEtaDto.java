package com.example.demo.dto;

import com.example.demo.entity.TripStatus;
import java.time.LocalDateTime;

public class TripEtaDto {

    private LocalDateTime estimatedArrivalTime;
    private Integer delayMinutes;
    private Double remainingKm;
    private TripStatus status;

    public TripEtaDto() {
    }

    public TripEtaDto(LocalDateTime estimatedArrivalTime, Integer delayMinutes, Double remainingKm, TripStatus status) {
        this.estimatedArrivalTime = estimatedArrivalTime;
        this.delayMinutes = delayMinutes;
        this.remainingKm = remainingKm;
        this.status = status;
    }

    public LocalDateTime getEstimatedArrivalTime() {
        return estimatedArrivalTime;
    }

    public void setEstimatedArrivalTime(LocalDateTime estimatedArrivalTime) {
        this.estimatedArrivalTime = estimatedArrivalTime;
    }

    public Integer getDelayMinutes() {
        return delayMinutes;
    }

    public void setDelayMinutes(Integer delayMinutes) {
        this.delayMinutes = delayMinutes;
    }

    public Double getRemainingKm() {
        return remainingKm;
    }

    public void setRemainingKm(Double remainingKm) {
        this.remainingKm = remainingKm;
    }

    public TripStatus getStatus() {
        return status;
    }

    public void setStatus(TripStatus status) {
        this.status = status;
    }
}
