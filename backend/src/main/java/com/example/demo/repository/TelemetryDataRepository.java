package com.example.demo.repository;

import com.example.demo.entity.TelemetryData;
import com.example.demo.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TelemetryDataRepository extends JpaRepository<TelemetryData, Long> {
    List<TelemetryData> findByVehicleOrderByRecordedAtDesc(Vehicle vehicle);
    void deleteByVehicle(Vehicle vehicle);

    @Query("SELECT MIN(t.recordedAt) FROM TelemetryData t")
    Optional<LocalDateTime> findMinRecordedAt();

    @Query("SELECT MAX(t.recordedAt) FROM TelemetryData t")
    Optional<LocalDateTime> findMaxRecordedAt();

    @Query("SELECT t FROM TelemetryData t JOIN FETCH t.vehicle WHERE t.recordedAt BETWEEN :start AND :end ORDER BY t.recordedAt ASC")
    List<TelemetryData> findRangeWithVehicle(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT t FROM TelemetryData t JOIN FETCH t.vehicle WHERE t.recordedAt <= :time AND t.id IN (SELECT MAX(t2.id) FROM TelemetryData t2 WHERE t2.recordedAt <= :time GROUP BY t2.vehicle.id)")
    List<TelemetryData> findLatestPerVehicleBefore(@Param("time") LocalDateTime time);
}