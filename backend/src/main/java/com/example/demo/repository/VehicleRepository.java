package com.example.demo.repository;

import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByStatus(VehicleStatus status);
    
    Optional<Vehicle> findByLicensePlate(String licensePlate);
}