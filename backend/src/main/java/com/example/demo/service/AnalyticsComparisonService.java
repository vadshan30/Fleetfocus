package com.example.demo.service;

import com.example.demo.dto.PeriodComparisonDto;
import com.example.demo.dto.PeriodComparisonDto.MetricDelta;
import com.example.demo.repository.AlertHistoryRepository;
import com.example.demo.repository.MaintenanceLogRepository;
import com.example.demo.repository.TripRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
public class AnalyticsComparisonService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private AlertHistoryRepository alertHistoryRepository;

    @Autowired
    private MaintenanceLogRepository maintenanceLogRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    public PeriodComparisonDto compare(LocalDate aStart, LocalDate aEnd, LocalDate bStart, LocalDate bEnd) {
        if (aStart == null) aStart = LocalDate.now().minusDays(29);
        if (aEnd == null) aEnd = LocalDate.now();

        if (bStart == null || bEnd == null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(aStart, aEnd) + 1;
            bEnd = aStart.minusDays(1);
            bStart = bEnd.minusDays(days - 1);
        }

        LocalDateTime startA = aStart.atStartOfDay();
        LocalDateTime endA = aEnd.atTime(LocalTime.MAX);

        LocalDateTime startB = bStart.atStartOfDay();
        LocalDateTime endB = bEnd.atTime(LocalTime.MAX);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d, yyyy");
        String labelA = aStart.format(fmt) + " – " + aEnd.format(fmt);
        String labelB = bStart.format(fmt) + " – " + bEnd.format(fmt);

        // 1. Trips
        Long tripsA = tripRepository.countCompletedBetween(startA, endA);
        Long tripsB = tripRepository.countCompletedBetween(startB, endB);
        double totalTripsA = tripsA != null ? tripsA.doubleValue() : 0.0;
        double totalTripsB = tripsB != null ? tripsB.doubleValue() : 0.0;

        // 2. Distance (km)
        Double distA = tripRepository.sumDistanceBetween(startA, endA);
        Double distB = tripRepository.sumDistanceBetween(startB, endB);
        double totalDistA = distA != null ? Math.round(distA * 10.0) / 10.0 : 0.0;
        double totalDistB = distB != null ? Math.round(distB * 10.0) / 10.0 : 0.0;

        // 3. Fuel (liters: 8.5 L / 100 km)
        double totalFuelA = Math.round(((totalDistA / 100.0) * 8.5) * 10.0) / 10.0;
        double totalFuelB = Math.round(((totalDistB / 100.0) * 8.5) * 10.0) / 10.0;

        // 4. Costs (fuel $1.8/L + maintenance)
        double fuelCostA = totalFuelA * 1.8;
        double fuelCostB = totalFuelB * 1.8;
        Double maintCostA = maintenanceLogRepository.sumCostBetween(aStart, aEnd, startA, endA);
        Double maintCostB = maintenanceLogRepository.sumCostBetween(bStart, bEnd, startB, endB);
        double totalCostA = Math.round((fuelCostA + (maintCostA != null ? maintCostA : 0.0)) * 100.0) / 100.0;
        double totalCostB = Math.round((fuelCostB + (maintCostB != null ? maintCostB : 0.0)) * 100.0) / 100.0;

        // 5. Alerts
        double totalAlertsA = alertHistoryRepository.countByOccurredAtBetween(startA, endA);
        double totalAlertsB = alertHistoryRepository.countByOccurredAtBetween(startB, endB);

        // 6. Utilization (%)
        long totalVehicles = vehicleRepository.count();
        Long activeVehiclesA = tripRepository.countActiveVehiclesBetween(startA, endA);
        Long activeVehiclesB = tripRepository.countActiveVehiclesBetween(startB, endB);
        double avgUtilA = totalVehicles > 0 && activeVehiclesA != null
                ? Math.min(100.0, Math.round(((activeVehiclesA.doubleValue() / totalVehicles) * 100.0) * 10.0) / 10.0)
                : 0.0;
        double avgUtilB = totalVehicles > 0 && activeVehiclesB != null
                ? Math.min(100.0, Math.round(((activeVehiclesB.doubleValue() / totalVehicles) * 100.0) * 10.0) / 10.0)
                : 0.0;

        PeriodComparisonDto dto = new PeriodComparisonDto();
        dto.setRangeALabel(labelA);
        dto.setRangeBLabel(labelB);
        dto.setRangeAStart(aStart);
        dto.setRangeAEnd(aEnd);
        dto.setRangeBStart(bStart);
        dto.setRangeBEnd(bEnd);

        dto.setTotalTripsA(totalTripsA);
        dto.setTotalTripsB(totalTripsB);
        dto.setTripsDelta(calculateDelta(totalTripsA, totalTripsB));

        dto.setTotalDistanceA(totalDistA);
        dto.setTotalDistanceB(totalDistB);
        dto.setDistanceDelta(calculateDelta(totalDistA, totalDistB));

        dto.setTotalFuelA(totalFuelA);
        dto.setTotalFuelB(totalFuelB);
        dto.setFuelDelta(calculateDelta(totalFuelA, totalFuelB));

        dto.setTotalCostA(totalCostA);
        dto.setTotalCostB(totalCostB);
        dto.setCostDelta(calculateDelta(totalCostA, totalCostB));

        dto.setTotalAlertsA(totalAlertsA);
        dto.setTotalAlertsB(totalAlertsB);
        dto.setAlertsDelta(calculateDelta(totalAlertsA, totalAlertsB));

        dto.setAvgUtilizationA(avgUtilA);
        dto.setAvgUtilizationB(avgUtilB);
        dto.setUtilizationDelta(calculateDelta(avgUtilA, avgUtilB));

        return dto;
    }

    private MetricDelta calculateDelta(Double currentA, Double previousB) {
        if (currentA == null) currentA = 0.0;
        if (previousB == null) previousB = 0.0;

        double diff = currentA - previousB;
        double percent;
        if (previousB > 0.0) {
            percent = (diff / previousB) * 100.0;
        } else if (currentA > 0.0) {
            percent = 100.0;
        } else {
            percent = 0.0;
        }

        String direction;
        if (percent > 0.1) {
            direction = "UP";
        } else if (percent < -0.1) {
            direction = "DOWN";
        } else {
            direction = "FLAT";
        }

        return new MetricDelta(diff, percent, direction);
    }
}
