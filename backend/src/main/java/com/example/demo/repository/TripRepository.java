package com.example.demo.repository;

import com.example.demo.entity.Trip;
import com.example.demo.entity.TripStatus;
import com.example.demo.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT t FROM Trip t WHERE t.driver.user.username = :username ORDER BY t.startTime DESC")
    List<Trip> findByDriverUsername(@Param("username") String username);

    @Query("SELECT t FROM Trip t WHERE t.vehicle.id = :vehicleId " +
           "AND t.status IN (com.example.demo.entity.TripStatus.SCHEDULED, com.example.demo.entity.TripStatus.IN_PROGRESS)")
    List<Trip> findActiveByVehicleId(@Param("vehicleId") Long vehicleId);

    @Query("SELECT t FROM Trip t WHERE t.driver.user.username = :username " +
           "AND t.status IN (com.example.demo.entity.TripStatus.SCHEDULED, com.example.demo.entity.TripStatus.IN_PROGRESS) " +
           "ORDER BY t.scheduledStartTime ASC")
    List<Trip> findActiveByDriverUsername(@Param("username") String username);

    @Query("SELECT COUNT(t) FROM Trip t WHERE t.status = com.example.demo.entity.TripStatus.COMPLETED " +
           "AND ((t.actualStartTime IS NOT NULL AND t.actualStartTime >= :start AND t.actualStartTime <= :end) " +
           "OR (t.actualStartTime IS NULL AND t.startTime >= :start AND t.startTime <= :end))")
    Long countCompletedBetween(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    @Query("SELECT COALESCE(SUM(t.distanceCovered), 0.0) FROM Trip t WHERE t.status = com.example.demo.entity.TripStatus.COMPLETED " +
           "AND ((t.actualStartTime IS NOT NULL AND t.actualStartTime >= :start AND t.actualStartTime <= :end) " +
           "OR (t.actualStartTime IS NULL AND t.startTime >= :start AND t.startTime <= :end))")
    Double sumDistanceBetween(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    @Query("SELECT COUNT(DISTINCT t.vehicle.id) FROM Trip t WHERE " +
           "((t.actualStartTime IS NOT NULL AND t.actualStartTime <= :end) OR (t.actualStartTime IS NULL AND t.startTime <= :end)) " +
           "AND ((t.actualEndTime IS NOT NULL AND t.actualEndTime >= :start) OR (t.actualEndTime IS NULL AND t.status = com.example.demo.entity.TripStatus.IN_PROGRESS))")
    Long countActiveVehiclesBetween(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);
}