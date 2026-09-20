package com.example.demo.repository;

import com.example.demo.entity.AlertRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRuleRepository extends JpaRepository<AlertRule, Long> {

    List<AlertRule> findByActiveTrue();

    List<AlertRule> findByVehicleId(Long vehicleId);

    @Query("SELECT r FROM AlertRule r WHERE r.vehicleId IS NULL AND r.active = true")
    List<AlertRule> findByVehicleIdIsNullAndActiveTrue();

    @Query("SELECT r FROM AlertRule r WHERE r.vehicleId = :vehicleId AND r.active = true")
    List<AlertRule> findByVehicleIdAndActiveTrue(@Param("vehicleId") Long vehicleId);
}