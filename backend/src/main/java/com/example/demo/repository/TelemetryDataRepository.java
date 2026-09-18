package com.example.demo.repository;

import com.example.demo.entity.TelemetryData;
import com.example.demo.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelemetryDataRepository extends JpaRepository<TelemetryData, Long> {
    List<TelemetryData> findByVehicleOrderByRecordedAtDesc(Vehicle vehicle);
    void deleteByVehicle(Vehicle vehicle);
}