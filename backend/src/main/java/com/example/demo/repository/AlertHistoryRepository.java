package com.example.demo.repository;

import com.example.demo.entity.AlertHistory;
import com.example.demo.entity.AlertSeverity;
import com.example.demo.entity.AlertType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertHistoryRepository extends JpaRepository<AlertHistory, Long> {

    List<AlertHistory> findByAcknowledgedFalseOrderByOccurredAtDesc();

    Page<AlertHistory> findAllByOrderByOccurredAtDesc(Pageable pageable);

    Page<AlertHistory> findByAlertTypeOrderByOccurredAtDesc(AlertType alertType, Pageable pageable);

    Page<AlertHistory> findByAcknowledgedOrderByOccurredAtDesc(Boolean acknowledged, Pageable pageable);

    Page<AlertHistory> findBySeverityOrderByOccurredAtDesc(AlertSeverity severity, Pageable pageable);

    Page<AlertHistory> findByResolvedOrderByOccurredAtDesc(Boolean resolved, Pageable pageable);

    @Query("SELECT a FROM AlertHistory a WHERE a.vehicleId = :vehicleId AND a.alertType = :alertType AND a.occurredAt > :since")
    List<AlertHistory> findByVehicleIdAndAlertTypeAndOccurredAtAfter(
            @Param("vehicleId") Long vehicleId,
            @Param("alertType") AlertType alertType,
            @Param("since") LocalDateTime since);

    @Query("SELECT a FROM AlertHistory a WHERE a.ruleId = :ruleId AND a.vehicleId = :vehicleId AND a.occurredAt > :since")
    List<AlertHistory> findByRuleIdAndVehicleIdAndOccurredAtAfter(
            @Param("ruleId") Long ruleId,
            @Param("vehicleId") Long vehicleId,
            @Param("since") LocalDateTime since);

    long countByAcknowledgedFalse();

    long countBySeverityAndAcknowledgedFalse(AlertSeverity severity);

    long countByAlertTypeAndAcknowledgedFalse(AlertType alertType);
}