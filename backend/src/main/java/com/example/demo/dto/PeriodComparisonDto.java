package com.example.demo.dto;

import java.time.LocalDate;

public class PeriodComparisonDto {

    private String rangeALabel;
    private String rangeBLabel;

    private LocalDate rangeAStart;
    private LocalDate rangeAEnd;
    private LocalDate rangeBStart;
    private LocalDate rangeBEnd;

    private Double totalTripsA;
    private Double totalTripsB;
    private MetricDelta tripsDelta;

    private Double totalDistanceA;
    private Double totalDistanceB;
    private MetricDelta distanceDelta;

    private Double totalFuelA;
    private Double totalFuelB;
    private MetricDelta fuelDelta;

    private Double totalCostA;
    private Double totalCostB;
    private MetricDelta costDelta;

    private Double totalAlertsA;
    private Double totalAlertsB;
    private MetricDelta alertsDelta;

    private Double avgUtilizationA;
    private Double avgUtilizationB;
    private MetricDelta utilizationDelta;

    public PeriodComparisonDto() {
    }

    public static class MetricDelta {
        private Double value;
        private Double percentChange;
        private String direction; // 'UP', 'DOWN', 'FLAT'

        public MetricDelta() {
        }

        public MetricDelta(Double value, Double percentChange, String direction) {
            this.value = value != null ? Math.round(value * 100.0) / 100.0 : 0.0;
            this.percentChange = percentChange != null ? Math.round(percentChange * 10.0) / 10.0 : 0.0;
            this.direction = direction;
        }

        public Double getValue() {
            return value;
        }

        public void setValue(Double value) {
            this.value = value;
        }

        public Double getPercentChange() {
            return percentChange;
        }

        public void setPercentChange(Double percentChange) {
            this.percentChange = percentChange;
        }

        public String getDirection() {
            return direction;
        }

        public void setDirection(String direction) {
            this.direction = direction;
        }
    }

    public String getRangeALabel() {
        return rangeALabel;
    }

    public void setRangeALabel(String rangeALabel) {
        this.rangeALabel = rangeALabel;
    }

    public String getRangeBLabel() {
        return rangeBLabel;
    }

    public void setRangeBLabel(String rangeBLabel) {
        this.rangeBLabel = rangeBLabel;
    }

    public LocalDate getRangeAStart() {
        return rangeAStart;
    }

    public void setRangeAStart(LocalDate rangeAStart) {
        this.rangeAStart = rangeAStart;
    }

    public LocalDate getRangeAEnd() {
        return rangeAEnd;
    }

    public void setRangeAEnd(LocalDate rangeAEnd) {
        this.rangeAEnd = rangeAEnd;
    }

    public LocalDate getRangeBStart() {
        return rangeBStart;
    }

    public void setRangeBStart(LocalDate rangeBStart) {
        this.rangeBStart = rangeBStart;
    }

    public LocalDate getRangeBEnd() {
        return rangeBEnd;
    }

    public void setRangeBEnd(LocalDate rangeBEnd) {
        this.rangeBEnd = rangeBEnd;
    }

    public Double getTotalTripsA() {
        return totalTripsA;
    }

    public void setTotalTripsA(Double totalTripsA) {
        this.totalTripsA = totalTripsA;
    }

    public Double getTotalTripsB() {
        return totalTripsB;
    }

    public void setTotalTripsB(Double totalTripsB) {
        this.totalTripsB = totalTripsB;
    }

    public MetricDelta getTripsDelta() {
        return tripsDelta;
    }

    public void setTripsDelta(MetricDelta tripsDelta) {
        this.tripsDelta = tripsDelta;
    }

    public Double getTotalDistanceA() {
        return totalDistanceA;
    }

    public void setTotalDistanceA(Double totalDistanceA) {
        this.totalDistanceA = totalDistanceA;
    }

    public Double getTotalDistanceB() {
        return totalDistanceB;
    }

    public void setTotalDistanceB(Double totalDistanceB) {
        this.totalDistanceB = totalDistanceB;
    }

    public MetricDelta getDistanceDelta() {
        return distanceDelta;
    }

    public void setDistanceDelta(MetricDelta distanceDelta) {
        this.distanceDelta = distanceDelta;
    }

    public Double getTotalFuelA() {
        return totalFuelA;
    }

    public void setTotalFuelA(Double totalFuelA) {
        this.totalFuelA = totalFuelA;
    }

    public Double getTotalFuelB() {
        return totalFuelB;
    }

    public void setTotalFuelB(Double totalFuelB) {
        this.totalFuelB = totalFuelB;
    }

    public MetricDelta getFuelDelta() {
        return fuelDelta;
    }

    public void setFuelDelta(MetricDelta fuelDelta) {
        this.fuelDelta = fuelDelta;
    }

    public Double getTotalCostA() {
        return totalCostA;
    }

    public void setTotalCostA(Double totalCostA) {
        this.totalCostA = totalCostA;
    }

    public Double getTotalCostB() {
        return totalCostB;
    }

    public void setTotalCostB(Double totalCostB) {
        this.totalCostB = totalCostB;
    }

    public MetricDelta getCostDelta() {
        return costDelta;
    }

    public void setCostDelta(MetricDelta costDelta) {
        this.costDelta = costDelta;
    }

    public Double getTotalAlertsA() {
        return totalAlertsA;
    }

    public void setTotalAlertsA(Double totalAlertsA) {
        this.totalAlertsA = totalAlertsA;
    }

    public Double getTotalAlertsB() {
        return totalAlertsB;
    }

    public void setTotalAlertsB(Double totalAlertsB) {
        this.totalAlertsB = totalAlertsB;
    }

    public MetricDelta getAlertsDelta() {
        return alertsDelta;
    }

    public void setAlertsDelta(MetricDelta alertsDelta) {
        this.alertsDelta = alertsDelta;
    }

    public Double getAvgUtilizationA() {
        return avgUtilizationA;
    }

    public void setAvgUtilizationA(Double avgUtilizationA) {
        this.avgUtilizationA = avgUtilizationA;
    }

    public Double getAvgUtilizationB() {
        return avgUtilizationB;
    }

    public void setAvgUtilizationB(Double avgUtilizationB) {
        this.avgUtilizationB = avgUtilizationB;
    }

    public MetricDelta getUtilizationDelta() {
        return utilizationDelta;
    }

    public void setUtilizationDelta(MetricDelta utilizationDelta) {
        this.utilizationDelta = utilizationDelta;
    }
}
