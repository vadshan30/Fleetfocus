package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "drivers")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private SystemUser user;

    @Column(name = "license_number", unique = true, nullable = false)
    private String licenseNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriverStatus status;

    public Driver() {
    }

    public Driver(SystemUser user, String licenseNumber) {
        this.user = user;
        this.licenseNumber = licenseNumber;
        this.status = DriverStatus.AVAILABLE;
    }

    public Driver(Long id, SystemUser user) {
        this.id = id;
        this.user = user;
        this.licenseNumber = "DEFAULT";
        this.status = DriverStatus.AVAILABLE;
    }

    public Driver(SystemUser user, String licenseNumber, DriverStatus status) {
        this.user = user;
        this.licenseNumber = licenseNumber;
        this.status = status;
    }

    public Driver(Long id, SystemUser user, String licenseNumber, DriverStatus status) {
        this.id = id;
        this.user = user;
        this.licenseNumber = licenseNumber;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SystemUser getUser() {
        return user;
    }

    public void setUser(SystemUser user) {
        this.user = user;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public DriverStatus getStatus() {
        return status;
    }

    public void setStatus(DriverStatus status) {
        this.status = status;
    }
}