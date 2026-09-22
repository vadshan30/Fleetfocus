package com.example.demo.repository;

import com.example.demo.entity.MaintenanceLog;
import com.example.demo.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {
    void deleteByVehicle(Vehicle vehicle);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(m.cost), 0.0) FROM MaintenanceLog m WHERE " +
           "(m.serviceDate IS NOT NULL AND m.serviceDate >= :startDate AND m.serviceDate <= :endDate) " +
           "OR (m.serviceDate IS NULL AND m.reportedAt IS NOT NULL AND m.reportedAt >= :startDateTime AND m.reportedAt <= :endDateTime)")
    Double sumCostBetween(
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate,
            @org.springframework.data.repository.query.Param("startDateTime") java.time.LocalDateTime startDateTime,
            @org.springframework.data.repository.query.Param("endDateTime") java.time.LocalDateTime endDateTime);
}