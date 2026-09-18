package com.example.demo.repository;

import com.example.demo.entity.Trip;
import com.example.demo.entity.TripStatus;
import com.example.demo.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findAllByStatus(TripStatus status);

    List<Trip> findByDriverIdAndStatus(Long driverId, TripStatus status);

    void deleteByVehicle(Vehicle vehicle);

    List<Trip> findByDriverId(Long driverId);

    List<Trip> findByVehicleId(Long vehicleId);

    List<Trip> findByVehicleIdAndStatus(Long vehicleId, TripStatus status);
}