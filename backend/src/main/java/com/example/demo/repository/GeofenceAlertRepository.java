package com.example.demo.repository;

import com.example.demo.entity.GeofenceAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GeofenceAlertRepository extends JpaRepository<GeofenceAlert, Long> {

    List<GeofenceAlert> findByAcknowledgedFalseOrderByOccurredAtDesc();

    @Query("SELECT a FROM GeofenceAlert a WHERE a.vehicleId = :vehicleId AND a.geofenceId = :geofenceId AND a.occurredAt > :since")
    List<GeofenceAlert> findByVehicleIdAndGeofenceIdAndOccurredAtAfter(
            @Param("vehicleId") Long vehicleId,
            @Param("geofenceId") Long geofenceId,
            @Param("since") LocalDateTime since);

    Page<GeofenceAlert> findAllByOrderByOccurredAtDesc(Pageable pageable);

    Page<GeofenceAlert> findByAcknowledgedOrderByOccurredAtDesc(Boolean acknowledged, Pageable pageable);

    @Query("SELECT a FROM GeofenceAlert a WHERE a.severity = :severity ORDER BY a.occurredAt DESC")
    Page<GeofenceAlert> findBySeverityOrderByOccurredAtDesc(@Param("severity") com.example.demo.entity.AlertSeverity severity, Pageable pageable);

    @Query("SELECT a FROM GeofenceAlert a WHERE a.resolved = :resolved ORDER BY a.occurredAt DESC")
    Page<GeofenceAlert> findByResolvedOrderByOccurredAtDesc(@Param("resolved") Boolean resolved, Pageable pageable);

    long countByAcknowledgedFalse();

    long countBySeverityAndAcknowledgedFalse(com.example.demo.entity.AlertSeverity severity);
}