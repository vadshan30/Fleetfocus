package com.example.demo.repository;

import com.example.demo.entity.AlertHistory;
import com.example.demo.entity.AlertSeverity;
import com.example.demo.entity.AlertType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    long countBySeverity(AlertSeverity severity);

    long countByResolvedTrue();

    Optional<AlertHistory> findFirstByAcknowledgedFalseOrderByOccurredAtAsc();

    long countByOccurredAtAfter(LocalDateTime cutoff);

    // Server-side pagination with filters
    @Query("SELECT a FROM AlertHistory a WHERE " +
           "(:acknowledged IS NULL OR a.acknowledged = :acknowledged) AND " +
           "(:resolved IS NULL OR a.resolved = :resolved) AND " +
           "(:severity IS NULL OR a.severity = :severity) AND " +
           "(:alertType IS NULL OR a.alertType = :alertType) AND " +
           "(:vehicleId IS NULL OR a.vehicleId = :vehicleId) AND " +
           "(:from IS NULL OR a.occurredAt >= :from) AND " +
           "(:to IS NULL OR a.occurredAt <= :to) " +
           "ORDER BY a.occurredAt DESC")
    Page<AlertHistory> findWithFilters(
            @Param("acknowledged") Boolean acknowledged,
            @Param("resolved") Boolean resolved,
            @Param("severity") AlertSeverity severity,
            @Param("alertType") AlertType alertType,
            @Param("vehicleId") Long vehicleId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable);

    // Delete resolved alerts older than cutoff
    @Modifying
    @Query("DELETE FROM AlertHistory a WHERE a.resolved = true " +
           "AND a.occurredAt < :cutoff")
    int deleteResolvedBefore(@Param("cutoff") LocalDateTime cutoff);

    // Bulk acknowledge
    @Modifying
    @Query("UPDATE AlertHistory a SET a.acknowledged = true, " +
           "a.acknowledgedAt = :now, a.acknowledgedBy = :user " +
           "WHERE a.id IN :ids AND a.acknowledged = false")
    int bulkAcknowledge(@Param("ids") List<Long> ids, 
                        @Param("now") LocalDateTime now, 
                        @Param("user") String user);

    // Bulk resolve
    @Modifying
    @Query("UPDATE AlertHistory a SET a.resolved = true, " +
           "a.acknowledged = true, a.acknowledgedAt = :now, " +
           "a.acknowledgedBy = :user " +
           "WHERE a.id IN :ids")
    int bulkResolve(@Param("ids") List<Long> ids, 
                    @Param("now") LocalDateTime now, 
                    @Param("user") String user);
}