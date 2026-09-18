package com.example.demo.repository;

import com.example.demo.entity.TelemetryData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TelemetryRepository extends JpaRepository<TelemetryData, Long> {
    Optional<TelemetryData> findTopByVehicleIdOrderByRecordedAtDesc(Long vehicleId);
}