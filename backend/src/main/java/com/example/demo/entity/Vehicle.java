package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 17)
    private String vin;

    @Column(name = "license_plate", unique = true, nullable = false)
    private String licensePlate;

    @Column(nullable = false)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    @Column(name = "current_mileage")
    private Double currentMileage = 0.0;

    public Vehicle() {
    }

    public Vehicle(String vin, String licensePlate) {
        this.vin = vin;
        this.licensePlate = licensePlate;
        this.model = "Default Model";
        this.status = VehicleStatus.AVAILABLE;
        this.currentMileage = 0.0;
    }

    public Vehicle(Long id, String vin) {
        this.id = id;
        this.vin = vin;
        this.licensePlate = "DEFAULT";
        this.model = "Default Model";
        this.status = VehicleStatus.AVAILABLE;
        this.currentMileage = 0.0;
    }
    

    public Vehicle(String vin, String licensePlate, String model, VehicleStatus status) {
        this.vin = vin;
        this.licensePlate = licensePlate;
        this.model = model;
        this.status = status;
        this.currentMileage = 0.0;
    }

    public Vehicle(Long id, String vin, String licensePlate, String model, VehicleStatus status) {
        this.id = id;
        this.vin = vin;
        this.licensePlate = licensePlate;
        this.model = model;
        this.status = status;
        this.currentMileage = 0.0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVin() {
        return vin;
    }

    public void setVin(String vin) {
        this.vin = vin;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public VehicleStatus getStatus() {
        return status;
    }

    public void setStatus(VehicleStatus status) {
        this.status = status;
    }

    public Double getCurrentMileage() {
        return currentMileage;
    }

    public void setCurrentMileage(Double currentMileage) {
        this.currentMileage = currentMileage;
    }
}